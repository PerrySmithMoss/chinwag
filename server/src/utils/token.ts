import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

export const signJwt = (payload: object, options: jwt.SignOptions): string =>
  jwt.sign(payload, config.jwtSecret, { ...options, algorithm: "HS256" });

export function verifyJwt(token: unknown): JwtPayload | null {
  if (typeof token !== "string") return null;

  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    return typeof payload === "object" && typeof payload.exp === "number" ? payload : null;
  } catch {
    return null;
  }
}
