import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createUser, updateUser, deleteUser } from "@/lib/user-actions";
import type { UserJSON, DeletedObjectJSON } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`,
    );

    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;

      case "user.updated":
        await handleUserUpdated(evt.data);
        break;

      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}

async function handleUserCreated(userData: UserJSON) {
  try {
    const { id, email_addresses } = userData;

    console.log("Debug - Full user data:", JSON.stringify(userData, null, 2));
    console.log(
      "Debug - Email addresses:",
      JSON.stringify(email_addresses, null, 2),
    );

    // Extract primary email (first verified email or first email if none verified)
    let primaryEmail = email_addresses?.find(
      (email) =>
        (email.verification as { verified?: boolean })?.verified === true,
    );

    // If no verified email found, use the first email address
    if (!primaryEmail && email_addresses && email_addresses.length > 0) {
      primaryEmail = email_addresses[0];
      console.log(
        "Debug - Using first email address:",
        primaryEmail.email_address,
      );
    }

    if (!primaryEmail?.email_address) {
      console.error("No email found for user:", id);
      console.error("Available email addresses:", email_addresses);
      return;
    }

    console.log(
      "Debug - Creating user with email:",
      primaryEmail.email_address,
    );

    await createUser({
      id,
      email: primaryEmail.email_address,
      billing_model: "pay-per-token",
      stripe_customer_id: undefined,
    });

    console.log(`User ${id} created successfully`);
  } catch (error) {
    console.error(`Error creating user ${userData.id}:`, error);
  }
}

async function handleUserUpdated(userData: UserJSON) {
  try {
    const { id, email_addresses } = userData;

    // Extract primary email (first verified email or first email if none verified)
    let primaryEmail = email_addresses?.find(
      (email) =>
        (email.verification as { verified?: boolean })?.verified === true,
    );

    // If no verified email found, use the first email address
    if (!primaryEmail && email_addresses && email_addresses.length > 0) {
      primaryEmail = email_addresses[0];
    }

    if (!primaryEmail?.email_address) {
      console.error("No email found for user:", id);
      return;
    }

    await updateUser({
      email: primaryEmail.email_address,
    });

    console.log(`User ${id} updated successfully`);
  } catch (error) {
    console.error(`Error updating user ${userData.id}:`, error);
  }
}

async function handleUserDeleted(userData: DeletedObjectJSON) {
  try {
    const { id } = userData;

    await deleteUser(id);

    console.log(`User ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error handling user deletion ${userData.id}:`, error);
  }
}
