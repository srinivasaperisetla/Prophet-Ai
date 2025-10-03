"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "./supabase";
import { UserData, TokenLedgerData } from "./types";
import {
  decryptApiKey,
  createApiKey,
  hashApiKey,
  encryptApiKey,
} from "@/lib/api-key-utils";

// ============================================================================
// USER SERVER ACTIONS (Complete User Management)
// ============================================================================

export async function createUser(userData: Omit<UserData, "created_at">) {
  try {
    const supabase = await createSupabaseServerClient();

    // Create user
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    // Create token ledger for new user
    try {
      await createTokenLedgerForUser(data.id);
      console.log("Created token ledger for new user");
    } catch (ledgerError) {
      console.error("Error creating token ledger:", ledgerError);
      // Continue even if token ledger creation fails
    }

    // Create API key for new user
    try {
      const apiKeyResult = await createApiKeyForUser(data.id);
      console.log(
        "Created initial API key for new user:",
        apiKeyResult.rawKey?.substring(0, 8) + "...",
      );
    } catch (apiKeyError) {
      console.error("Error creating API key:", apiKeyError);
      // Continue even if API key creation fails
    }

    return data;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

export async function getUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const supabase = await createSupabaseServerClient();

    // Get complete user data with all relationships
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        token_ledger(*),
        api_keys(*)
      `,
      )
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching user:", error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    // Decrypt API key for display if it exists
    let userData = data;
    if (data !== null && data.api_keys) {
      const apiKey = Array.isArray(data.api_keys)
        ? data.api_keys[0]
        : data.api_keys;
      if (apiKey.encrypted_key) {
        const rawKey = decryptApiKey(apiKey.encrypted_key);
        userData = {
          ...data,
          api_keys: {
            ...apiKey,
            rawKey,
          },
        };
      }
    }

    return userData;
  } catch (error) {
    console.error("Error in getUser:", error);
    throw error;
  }
}

export async function updateUser(updates: Partial<UserData>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

export async function updateTokenLedger(updates: Partial<TokenLedgerData>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("token_ledger")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating token ledger:", error);
      throw new Error(`Failed to update token ledger: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateTokenLedger:", error);
    throw error;
  }
}

export async function deleteUser(userId?: string) {
  try {
    // If userId is provided (webhook), use it; otherwise get from auth
    let targetUserId: string;

    if (userId) {
      targetUserId = userId;
    } else {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      targetUserId = authUserId;
    }

    const supabase = await createSupabaseServerClient();

    // Delete user and all related data (cascade will handle related tables)
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", targetUserId);

    if (error) {
      console.error("Error deleting user:", error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return {
      success: true,
      message: "User account deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to delete user account",
    };
  }
}

export async function regenerateApiKey() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const supabase = await createSupabaseServerClient();

    // First, delete the existing API key
    const { error: deleteError } = await supabase
      .from("api_keys")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting API key:", deleteError);
      throw new Error(`Failed to delete API key: ${deleteError.message}`);
    }

    // Create new API key using the helper function
    const newApiKey = await createApiKeyForUser(userId);

    return {
      success: true,
      apiKey: newApiKey,
    };
  } catch (error) {
    console.error("Error in regenerateApiKey:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS (For internal use)
// ============================================================================

const createTokenLedgerForUser = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Check if token ledger already exists
    const { data: existingLedger } = await supabase
      .from("token_ledger")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingLedger) {
      console.log("Token ledger already exists for user:", userId);
      return existingLedger;
    }

    // Create new token ledger
    const { data, error } = await supabase
      .from("token_ledger")
      .insert([
        {
          user_id: userId,
          available: 100,
          used: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating token ledger:", error);
      throw new Error(`Failed to create token ledger: ${error.message}`);
    }

    console.log("Created new token ledger for user:", userId);
    return data;
  } catch (error) {
    console.error("Error in createTokenLedgerForUser:", error);
    throw error;
  }
};

const createApiKeyForUser = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const apiKey = createApiKey();
    const hashedKey = hashApiKey(apiKey);
    const encryptedKey = encryptApiKey(apiKey);

    // Create new API key
    const { data, error } = await supabase
      .from("api_keys")
      .insert([
        {
          user_id: userId,
          hashed_key: hashedKey,
          encrypted_key: encryptedKey,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return {
      ...data,
      rawKey: apiKey, // Return raw key for initial display
    };
  } catch (error) {
    console.error("Error in createApiKeyForUser:", error);
    throw error;
  }
};
