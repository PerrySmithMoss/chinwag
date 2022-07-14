import jwt from "jsonwebtoken";
import { config } from "../../config/config";

export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  const signingKey = Buffer.from(
    keyName === "accessTokenPrivateKey"
      ? (config.accessTokenPrivateKey as string)
      : (config.refreshTokenPrivateKey as string),
    "base64"
  ).toString("ascii");

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt<T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null {
  const publicKey = Buffer.from(
    keyName === "accessTokenPublicKey"
      ? (config.accessTokenPublicKey as string)
      : (config.refreshTokenPublicKey as string),
    "base64"
  ).toString("ascii");

  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}
