import crypto from "crypto";

const SCRYPT_KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey.toString("hex"));
    });
  });

  return `scrypt:${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const parts = encodedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const [, salt, storedHash] = parts;

  const computedHash = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey.toString("hex"));
    });
  });

  const provided = Buffer.from(computedHash, "hex");
  const expected = Buffer.from(storedHash, "hex");
  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}
