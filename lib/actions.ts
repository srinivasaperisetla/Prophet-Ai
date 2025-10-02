import { auth, currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "./supabase";
import crypto from "crypto";
import { UserData, TokenLedgerData, ApiKeyData } from "./types";

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export const syncUserWithClerk = async () => {
  try {
    console.log("=== Starting user sync process ===");

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing required Supabase environment variables");
    }

    // Get Clerk user data
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      throw new Error("No authenticated user found in Clerk");
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      throw new Error("No email address found for user");
    }

    console.log("Clerk user ID:", userId);
    console.log("Clerk user email:", userEmail);

    // Check if user already exists in Supabase by Clerk ID
    let existingUser = await getUserByClerkId(userId);

    if (existingUser) {
      console.log(
        "User already exists in Supabase with Clerk ID:",
        existingUser.id,
      );

      // Ensure token ledger exists
      try {
        await createTokenLedger(existingUser.id);
        console.log("Token ledger ensured for existing user");
      } catch (ledgerError) {
        console.log("Token ledger already exists or error:", ledgerError);
      }

      // Ensure API key exists
      try {
        const existingApiKey = await getUserApiKeys(existingUser.id);
        if (!existingApiKey) {
          const apiKeyResult = await createApiKey(existingUser.id);
          console.log(
            "Created missing API key for existing user:",
            apiKeyResult.rawKey,
          );
        } else {
          console.log("API key already exists for user");
        }
      } catch (apiKeyError) {
        console.log("API key check/creation error:", apiKeyError);
      }

      return existingUser;
    }

    // Check if user exists by email (in case they signed up before but with different Clerk ID)
    const userByEmail = await getUserByEmail(userEmail);

    if (userByEmail) {
      console.log("User exists by email but different Clerk ID, updating...");

      // Update the existing user's ID to match Clerk ID
      const updatedUser = await updateUser(userByEmail.id, { id: userId });
      console.log("Updated user ID to match Clerk ID:", updatedUser.id);

      // Ensure token ledger and API key exist
      try {
        await createTokenLedger(updatedUser.id);
        console.log("Token ledger ensured for updated user");
      } catch (ledgerError) {
        console.log("Token ledger already exists or error:", ledgerError);
      }

      try {
        const existingApiKey = await getUserApiKeys(updatedUser.id);
        if (!existingApiKey) {
          const apiKeyResult = await createApiKey(updatedUser.id);
          console.log(
            "Created missing API key for updated user:",
            apiKeyResult.rawKey,
          );
        } else {
          console.log("API key already exists for updated user");
        }
      } catch (apiKeyError) {
        console.log("API key check/creation error:", apiKeyError);
      }

      return updatedUser;
    }

    // Create new user
    console.log("Creating new user in Supabase...");
    const userData: Omit<UserData, "created_at"> = {
      id: userId,
      email: userEmail,
      billing_model: "pay-per-token", // Set default billing model
    };

    const newUser = await createUser(userData);
    console.log("Created new user in Supabase:", newUser.id);

    // Create token ledger for new user
    try {
      await createTokenLedger(newUser.id);
      console.log("Created token ledger for new user");
    } catch (ledgerError) {
      console.error("Error creating token ledger:", ledgerError);
      // Continue even if token ledger creation fails
    }

    // Create API key for new user
    try {
      const apiKeyResult = await createApiKey(newUser.id);
      console.log("Created initial API key for new user:", apiKeyResult.rawKey);
    } catch (apiKeyError) {
      console.error("Error creating API key:", apiKeyError);
      // Continue even if API key creation fails
    }

    console.log("=== User sync completed successfully ===");
    return newUser;
  } catch (error) {
    console.error("=== Error in syncUserWithClerk ===");
    console.error("Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};

export const getUserByClerkId = async (clerkId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", clerkId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching user:", error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getUserByClerkId:", error);
    throw error;
  }
};

export const createUser = async (userData: Omit<UserData, "created_at">) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      // Handle duplicate email error gracefully
      if (error.code === "23505" && error.message.includes("email")) {
        console.log(
          "User with this email already exists, fetching existing user",
        );
        return await getUserByEmail(userData.email);
      }
      console.error("Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

export const createTokenLedger = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Check if token ledger already exists
    const { data: existingLedger, error: checkError } = await supabase
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
    if (error instanceof Error && error.message.includes("already exists")) {
      // Token ledger already exists, return the existing one
      const supabase = await createSupabaseServerClient();
      const { data, error: fetchError } = await supabase
        .from("token_ledger")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching existing token ledger:", fetchError);
        throw new Error(
          `Failed to fetch existing token ledger: ${fetchError.message}`,
        );
      }

      return data;
    }

    console.error("Error in createTokenLedger:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching user by email:", error);
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    throw error;
  }
};

export const getUserApiKeys = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, user_id, encrypted_key, created_at")
      .eq("user_id", userId)
      .single(); // Use single() since there's only one API key per user

    if (error) {
      if (error.code === "PGRST116") {
        // No API key found for this user
        return null;
      }
      console.error("Error fetching API key:", error);
      throw new Error(`Failed to fetch API key: ${error.message}`);
    }

    console.log("Raw API key data:", data);

    // Decrypt the API key for display
    let rawKey = null;
    if (data.encrypted_key) {
      rawKey = decryptApiKey(data.encrypted_key);
      console.log(
        "Decrypted key for",
        data.id,
        ":",
        rawKey ? "SUCCESS" : "FAILED",
      );
    } else {
      console.log("No encrypted_key for key:", data.id);
    }

    const decryptedKey = {
      ...data,
      rawKey,
    };

    console.log("Final decrypted key:", {
      id: decryptedKey.id,
      hasRawKey: !!decryptedKey.rawKey,
    });

    return decryptedKey;
  } catch (error) {
    console.error("Error in getUserApiKeys:", error);
    throw error;
  }
};

export const getUserWithTokenLedger = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        token_ledger(*)
      `,
      )
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user with token ledger:", error);
      throw new Error(
        `Failed to fetch user with token ledger: ${error.message}`,
      );
    }

    return data;
  } catch (error) {
    console.error("Error in getUserWithTokenLedger:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Delete user and all related data (cascade will handle related tables)
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      console.error("Error deleting user:", error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    console.log(`Successfully deleted user ${userId} from Supabase`);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<UserData>,
) => {
  try {
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
};

export const updateTokenLedger = async (
  userId: string,
  updates: Partial<TokenLedgerData>,
) => {
  try {
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
};

// ============================================================================
// API KEY FUNCTIONS
// ============================================================================

export const createApiKey = async (userId: string, key?: string) => {
  try {
    const supabase = await createSupabaseServerClient();

    const apiKey = key || generateApiKey();
    const hashedKey = hashApiKey(apiKey);
    const encryptedKey = encryptApiKey(apiKey);

    // Check if user already has an API key
    const { data: existingKey, error: checkError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing API key:", checkError);
      throw new Error(
        `Failed to check existing API key: ${checkError.message}`,
      );
    }

    let result;
    if (existingKey) {
      // Update existing API key
      const { data, error } = await supabase
        .from("api_keys")
        .update({
          hashed_key: hashedKey,
          encrypted_key: encryptedKey,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating API key:", error);
        throw new Error(`Failed to update API key: ${error.message}`);
      }
      result = data;
    } else {
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
      result = data;
    }

    return {
      ...result,
      rawKey: apiKey, // Return raw key for initial display
    };
  } catch (error) {
    console.error("Error in createApiKey:", error);
    throw error;
  }
};

export const generateApiKey = () => {
  // Generate a random API key with 'pk_' prefix
  const randomBytes = crypto.randomBytes(32);
  const apiKey = "pk_" + randomBytes.toString("hex");
  return apiKey;
};

export const hashApiKey = (apiKey: string) => {
  // Hash the API key using SHA-256
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};

export const encryptApiKey = (apiKey: string) => {
  // Modern encryption for storing raw key
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(
    process.env.API_KEY_ENCRYPTION_SECRET || "fallback-secret",
    "salt",
    32,
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryptApiKey = (encryptedApiKey: string) => {
  try {
    console.log(
      "Attempting to decrypt API key, length:",
      encryptedApiKey?.length,
    );

    const algorithm = "aes-256-cbc";
    const encryptionSecret =
      process.env.API_KEY_ENCRYPTION_SECRET || "fallback-secret";
    console.log(
      "Using encryption secret:",
      encryptionSecret ? "SET" : "NOT SET",
    );

    const key = crypto.scryptSync(encryptionSecret, "salt", 32);
    const parts = encryptedApiKey.split(":");

    if (parts.length !== 2) {
      console.error(
        "Invalid encrypted key format, expected 2 parts, got:",
        parts.length,
      );
      return null;
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    console.log("IV length:", iv.length, "Encrypted length:", encrypted.length);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    console.log("Decryption successful, result length:", decrypted.length);
    return decrypted;
  } catch (error) {
    console.error("Error decrypting API key:", error);
    return null;
  }
};

export const verifyApiKey = async (apiKey: string) => {
  try {
    const supabase = await createSupabaseServerClient();
    const hashedKey = hashApiKey(apiKey);

    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("hashed_key", hashedKey)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error verifying API key:", error);
      throw new Error(`Failed to verify API key: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in verifyApiKey:", error);
    throw error;
  }
};

export const deleteAndRecreateApiKey = async (userId: string) => {
  try {
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

    // Generate a new API key
    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);
    const encryptedKey = encryptApiKey(apiKey);

    // Create the new API key
    const { data, error: createError } = await supabase
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

    if (createError) {
      console.error("Error creating new API key:", createError);
      throw new Error(`Failed to create new API key: ${createError.message}`);
    }

    return {
      ...data,
      rawKey: apiKey, // Return raw key for initial display
    };
  } catch (error) {
    console.error("Error in deleteAndRecreateApiKey:", error);
    throw error;
  }
};
