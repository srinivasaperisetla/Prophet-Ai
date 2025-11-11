"use server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";
import {
  CheckoutTransaction,
  TransactionData,
  PlanType,
  PlanConfig,
} from "./types";

// ============================================================================
// PLAN CONFIGURATION
// ============================================================================

const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  "starter-pack": {
    name: "Starter Pack",
    amount: 5,
    tokens: 500,
    isSubscription: false,
  },
  "base-pack": {
    name: "Base Pack",
    amount: 10,
    tokens: 1000,
    isSubscription: false,
  },
  "value-pack": {
    name: "Value Pack",
    amount: 20,
    tokens: 2500,
    isSubscription: false,
  },
  "high-roller-pack": {
    name: "High Roller Pack",
    amount: 50,
    tokens: 7500,
    isSubscription: false,
  },
  pro: {
    name: "Pro Plan (Monthly)",
    amount: 19,
    tokens: 2500,
    isSubscription: true,
  },
};

// ============================================================================
// CHECKOUT FUNCTION
// ============================================================================

export async function checkoutCredits(transaction: CheckoutTransaction) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const planConfig = PLAN_CONFIG[transaction.plan];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${transaction.plan}`);
    }

    const amount = planConfig.amount * 100; // Convert to cents

    // Build line item based on whether it's a subscription or one-time payment
    const lineItem = planConfig.isSubscription
      ? {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            recurring: {
              interval: "month" as const,
            },
            product_data: {
              name: planConfig.name,
              description: `${planConfig.tokens} tokens per month`,
            },
          },
          quantity: 1,
        }
      : {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: planConfig.name,
              description: `${planConfig.tokens} tokens`,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      line_items: [lineItem],
      metadata: {
        plan: transaction.plan,
        userId: transaction.userId,
        tokens: planConfig.tokens.toString(),
        isSubscription: planConfig.isSubscription.toString(),
      },
      mode: planConfig.isSubscription ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard/purchase-tokens`,
    });

    redirect(session.url!);
  } catch (error) {
    // Don't log redirect errors - they're expected behavior in Next.js
    // Redirect errors have a specific digest or message pattern
    if (
      error instanceof Error &&
      (error.message === "NEXT_REDIRECT" ||
        (error as any).digest?.includes("NEXT_REDIRECT"))
    ) {
      throw error; // Re-throw redirect errors without logging
    }
    console.error("Error in checkoutCredits:", error);
    throw error;
  }
}

// ============================================================================
// CREATE TRANSACTION FUNCTION
// ============================================================================

export async function createTransaction(
  transactionData: Omit<TransactionData, "id" | "created_at">,
) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get plan configuration
    const planConfig = PLAN_CONFIG[transactionData.plan];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${transactionData.plan}`);
    }

    // Get current token ledger
    const { data: tokenLedger, error: ledgerError } = await supabase
      .from("token_ledger")
      .select("*")
      .eq("user_id", transactionData.user_id)
      .single();

    if (ledgerError && ledgerError.code !== "PGRST116") {
      throw new Error(`Failed to fetch token ledger: ${ledgerError.message}`);
    }

    // Calculate new available tokens
    const currentAvailable = tokenLedger?.available || 0;
    const newAvailable = currentAvailable + transactionData.tokens;

    // Update token ledger
    const { error: updateError } = await supabase.from("token_ledger").upsert(
      {
        user_id: transactionData.user_id,
        available: newAvailable,
        used: tokenLedger?.used || 0,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (updateError) {
      throw new Error(`Failed to update token ledger: ${updateError.message}`);
    }

    // If it's a subscription, update billing model
    if (planConfig.isSubscription) {
      const supabase = await createSupabaseServerClient();
      const { error: updateUserError } = await supabase
        .from("users")
        .update({ billing_model: "pro" })
        .eq("id", transactionData.user_id);

      if (updateUserError) {
        console.error("Error updating billing model:", updateUserError.message);
        // Don't throw - transaction was successful
      }
    }

    // Store transaction in stripe_events table for tracking
    const { data: eventData, error: eventError } = await supabase
      .from("stripe_events")
      .insert([
        {
          user_id: transactionData.user_id,
          event_type: "payment_succeeded",
          raw_event: {
            plan: transactionData.plan,
            amount: transactionData.amount,
            tokens: transactionData.tokens,
            stripe_session_id: transactionData.stripe_session_id,
            stripe_payment_intent_id: transactionData.stripe_payment_intent_id,
            status: transactionData.status || "completed",
          },
        },
      ])
      .select()
      .single();

    if (eventError) {
      console.error("Error storing transaction event:", eventError);
      // Don't throw - transaction was successful, just logging failed
    }

    return {
      success: true,
      tokensAdded: transactionData.tokens,
      newBalance: newAvailable,
      transaction: eventData,
    };
  } catch (error) {
    console.error("Error in createTransaction:", error);
    throw error;
  }
}
