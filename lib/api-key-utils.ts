import crypto from "crypto";

// ============================================================================
// API KEY UTILITY FUNCTIONS (Pure Functions - No Database/Auth)
// ============================================================================

export const createApiKey = () => {
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
    const algorithm = "aes-256-cbc";
    const encryptionSecret =
      process.env.API_KEY_ENCRYPTION_SECRET || "fallback-secret";

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

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting API key:", error);
    return null;
  }
};
