import { createHmac } from "crypto";

/**
 * Creates a SHA-256 hash of a key using HMAC
 * Uses the HASH_SECRET environment variable as the secret key
 * @param key The key to hash
 * @returns Hexadecimal hash string
 */
export const createHash = async (key: string): Promise<string> => {
  const hmac = createHmac("sha256", process.env.HASH_SECRET as string);
  hmac.update(key);
  const hash = hmac.digest("hex");
  return hash;
};
