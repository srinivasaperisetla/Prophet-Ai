import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createTransaction } from "@/lib/transaction.action";
import { createSupabaseServerClient } from "@/lib/supabase";
import { PlanType } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Stripe webhook received");
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ No signature provided in webhook");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(
        `✅ Webhook verified - Event type: ${event.type}, ID: ${event.id}`,
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("📦 Processing checkout.session.completed event");
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }
      case "payment_intent.succeeded": {
        console.log("💳 Processing payment_intent.succeeded event");
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      }
      case "invoice.payment_succeeded": {
        console.log("📄 Processing invoice.payment_succeeded event");
        // Handle subscription renewals
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.id) {
          console.error("❌ Invoice ID is missing");
          break;
        }
        // Expand invoice to get subscription and payment_intent
        const expandedInvoice = await stripe.invoices.retrieve(invoice.id, {
          expand: ["subscription", "payment_intent"],
        });
        await handleInvoicePaymentSucceeded(expandedInvoice);
        break;
      }
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  try {
    console.log(`🔍 Processing checkout session: ${session.id}`);
    console.log(`📋 Session metadata:`, session.metadata);
    console.log(`💰 Payment status: ${session.payment_status}`);
    console.log(`📦 Mode: ${session.mode}`);

    const metadata = session.metadata;
    if (!metadata) {
      console.error("❌ No metadata in checkout session");
      return;
    }

    const userId = metadata.userId;
    const plan = metadata.plan as PlanType;
    const tokens = parseInt(metadata.tokens || "0", 10);
    const isSubscription = metadata.isSubscription === "true";

    console.log(`👤 User ID: ${userId}, Plan: ${plan}, Tokens: ${tokens}`);

    if (!userId || !plan || !tokens) {
      console.error("❌ Missing required metadata:", { userId, plan, tokens });
      return;
    }

    // Only process if payment is actually completed
    if (session.payment_status !== "paid") {
      console.log(
        `⏳ Payment not completed yet. Status: ${session.payment_status}`,
      );
      return;
    }

    // Get payment intent or subscription details
    let amount = 0;
    let paymentIntentId: string | undefined;
    let status: "pending" | "completed" | "failed" = "completed";
    let customerId: string | undefined;

    if (session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );
      amount = paymentIntent.amount / 100; // Convert from cents
      paymentIntentId = paymentIntent.id;
      status = paymentIntent.status === "succeeded" ? "completed" : "pending";
      customerId =
        typeof paymentIntent.customer === "string"
          ? paymentIntent.customer
          : paymentIntent.customer?.id;
    } else if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      amount = subscription.items.data[0]?.price.unit_amount
        ? subscription.items.data[0].price.unit_amount / 100
        : 0;
      customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      // For subscriptions: store customer ID and add userId to subscription metadata
      if (customerId && isSubscription) {
        const supabase = await createSupabaseServerClient();
        // Store Stripe customer ID in user record
        await supabase
          .from("users")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);

        // Add userId to subscription metadata for future renewals
        await stripe.subscriptions.update(session.subscription as string, {
          metadata: {
            ...subscription.metadata,
            userId: userId,
            plan: plan,
            tokens: tokens.toString(),
          },
        });
      }
    }

    // Also get customer ID from session if available
    if (!customerId && session.customer) {
      customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      if (customerId) {
        const supabase = await createSupabaseServerClient();
        await supabase
          .from("users")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }
    }

    // Create transaction
    console.log(`💾 Creating transaction for user ${userId}...`);
    const result = await createTransaction({
      user_id: userId,
      plan: plan,
      amount: amount,
      tokens: tokens,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      status: status,
    });

    console.log(
      `✅ Transaction completed for user ${userId}: ${tokens} tokens added. New balance: ${result.newBalance}`,
    );
  } catch (error) {
    console.error("❌ Error handling checkout session completed:", error);
    // Don't throw - we want to return 200 to Stripe even if processing fails
    // This prevents Stripe from retrying and potentially double-processing
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  try {
    // Retrieve the checkout session from metadata if available
    const sessionId = paymentIntent.metadata?.session_id;
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      await handleCheckoutSessionCompleted(session);
    } else {
      console.log("Payment intent succeeded but no session_id in metadata");
    }
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    payment_intent?: string | Stripe.PaymentIntent | null;
  },
) {
  try {
    // This handles subscription renewals
    if (!invoice.subscription) {
      return;
    }

    // Get subscription ID
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription.id;

    // Get subscription details
    const subscription =
      typeof invoice.subscription === "object"
        ? invoice.subscription
        : await stripe.subscriptions.retrieve(subscriptionId);

    // Try to get userId directly from subscription metadata (preferred)
    let userId = subscription.metadata?.userId;
    let plan: PlanType;
    let tokens: number;

    if (userId) {
      // We have userId directly from metadata - much better!
      plan = (subscription.metadata?.plan || "pro") as PlanType;
      tokens = parseInt(subscription.metadata?.tokens || "2500", 10);
    } else {
      // Fallback: look up by Stripe customer ID (for older subscriptions)
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;
      if (!customerId) {
        console.error("No customer ID found in subscription");
        return;
      }

      // Get user from Stripe customer ID
      const supabase = await createSupabaseServerClient();
      const { data: user, error } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (error || !user) {
        console.error("User not found for customer ID:", customerId);
        return;
      }

      userId = user.id;
      plan = (subscription.metadata?.plan || "pro") as PlanType;
      tokens = parseInt(subscription.metadata?.tokens || "2500", 10);
    }

    const amount = invoice.amount_paid / 100; // Convert from cents

    // Get payment intent ID
    const paymentIntentId = invoice.payment_intent
      ? typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent.id
      : undefined;

    // Create transaction for subscription renewal
    await createTransaction({
      user_id: userId,
      plan: plan,
      amount: amount,
      tokens: tokens,
      stripe_payment_intent_id: paymentIntentId,
      status: "completed",
    });

    console.log(
      `Subscription renewal processed for user ${userId}: ${tokens} tokens added`,
    );
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error);
  }
}
