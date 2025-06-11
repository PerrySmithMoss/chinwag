import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

interface SessionPayload extends JwtPayload {
  session: number;
}

export type VerifiedJWT = {
  valid: boolean;
  expired: boolean;
  decoded: SessionPayload | null;
};

export const signJwt = (
  object: Object,
  options?: jwt.SignOptions | undefined
): string => {
  return jwt.sign(object, config.jwtSecret, {
    ...(options && options),
    algorithm: "HS256",
  });
};

export const verifyJwt = (token: string): VerifiedJWT => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as SessionPayload;
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: unknown) {
    const error = e as jwt.TokenExpiredError | jwt.JsonWebTokenError;

    return {
      valid: false,
      expired: error.name === "TokenExpiredError",
      decoded: null,
    };
  }
};
