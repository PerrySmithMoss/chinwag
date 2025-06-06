import jwt from "jsonwebtoken";
import { config } from "../config/config";

type Session = {
  session: number;
};

export type VerifiedJWT = {
  valid: boolean;
  expired: boolean;
  decoded: Session | null;
};

export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, config.jwtSecret, {
    ...(options && options),
    algorithm: "HS256",
  });
}

export function verifyJwt(token: string): VerifiedJWT {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Session;
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}
