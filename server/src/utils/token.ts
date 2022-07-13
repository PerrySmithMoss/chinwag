import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";

import {
  AccessToken,
  AccessTokenPayload,
  Cookies,
  RefreshToken,
  RefreshTokenPayload,
  UserDocument,
} from "../types/types";

import { config } from "../../config/config";

enum TokenExpiration {
  Access = 5 * 60,
  Refresh = 7 * 24 * 60 * 60,
  RefreshIfLessThan = 4 * 24 * 60 * 60,
}

// function signAccessToken(payload: AccessTokenPayload) {
//   return jwt.sign(payload, config.accessTokenSecret, {expiresIn: TokenExpiration.Access})
// }

// function signRefreshToken(payload: RefreshTokenPayload) {
//   return jwt.sign(payload, config.refreshTokenSecret, {expiresIn: TokenExpiration.Refresh})
// }

// export function verifyRefreshToken(token: string) {
//     return jwt.verify(token, config.refreshTokenSecret) as RefreshToken
//   }

//   export function verifyAccessToken(token: string) {
//     try {
//       return jwt.verify(token, config.accessTokenSecret) as AccessToken
//     } catch (e) {
//       console.error(e)
//     }
//   }

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
      : (config.accessTokenPrivateKey as string),
    "base64"
  ).toString("ascii");

  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? "strict" : "lax",
  domain: config.serverDomain,
  path: "/",
};

const refreshTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Refresh * 1000,
};

const accessTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Access * 1000,
};
export function buildTokens(user: UserDocument) {
  const accessPayload: AccessTokenPayload = { userId: user.id };
  const refreshPayload: RefreshTokenPayload = {
    userId: user.id,
    version: user.tokenVersion,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

export function setTokens(res: Response, access: string, refresh?: string) {
  res.cookie(Cookies.AccessToken, access, accessTokenCookieOptions);
  if (refresh)
    res.cookie(Cookies.RefreshToken, refresh, refreshTokenCookieOptions);
}

export function refreshTokens(current: RefreshToken, tokenVersion: number) {
  if (tokenVersion !== current.version) throw "Token revoked";

  const accessPayload: AccessTokenPayload = { userId: current.userId };
  let refreshPayload: RefreshTokenPayload | undefined;

  const expiration = new Date(current.exp * 1000);
  const now = new Date();
  const secondsUntilExpiration = (expiration.getTime() - now.getTime()) / 1000;

  if (secondsUntilExpiration < TokenExpiration.RefreshIfLessThan) {
    refreshPayload = { userId: current.userId, version: tokenVersion };
  }

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

export function clearTokens(res: Response) {
  res.cookie(Cookies.AccessToken, "", { ...defaultCookieOptions, maxAge: 0 });
  res.cookie(Cookies.RefreshToken, "", { ...defaultCookieOptions, maxAge: 0 });
}
