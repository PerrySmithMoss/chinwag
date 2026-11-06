import { JwtPayload } from "jsonwebtoken";
import { User } from "../generated/prisma/client";
import { isUserId } from "../utils/userId";
import { signJwt, verifyJwt } from "../utils/token";

export function signRefreshToken(userId: number) {
  return signJwt({ session: userId }, { expiresIn: "7d" });
}

export function signAccessToken(user: Pick<User, "id" | "username" | "firstName" | "lastName">) {
  return signJwt(user, { expiresIn: "15m" });
}

export function verifyAccessToken(token: unknown): (JwtPayload & { id: number }) | null {
  const payload = verifyJwt(token);
  if (!payload || payload.aud !== undefined || payload.session !== undefined) return null;
  return isUserId(payload.id) ? { ...payload, id: payload.id } : null;
}

export function verifyRefreshToken(token: unknown): number | null {
  const payload = verifyJwt(token);
  if (!payload || payload.aud !== undefined || payload.id !== undefined) return null;
  return isUserId(payload.session) ? payload.session : null;
}

export function signSocketTicket(userId: number) {
  return signJwt({ userId }, { audience: "chinwag-socket", expiresIn: "30s" });
}

export function verifySocketTicket(token: unknown): number | null {
  const payload = verifyJwt(token);
  if (payload?.aud !== "chinwag-socket") return null;
  return isUserId(payload.userId) ? payload.userId : null;
}
