import { NextFunction, Request, Response } from "express";
import { signAccessToken, verifyAccessToken, verifyRefreshToken } from "../services/auth.service";
import { findUserById } from "../services/user.service";
import { accessTokenCookieOptions } from "../constants/cookies";
import { config } from "../config/config";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const access = verifyAccessToken(req.cookies[config.accessTokenCookieName]);
  if (access) {
    res.locals.user = access;
    next();
    return;
  }

  const userId = verifyRefreshToken(req.cookies[config.refreshTokenCookieName]);
  if (userId !== null) {
    const user = await findUserById(userId, true);
    if (user) {
      const publicUser = removeFieldsFromObject(user, ["password", "email"]);
      res.cookie(config.accessTokenCookieName, signAccessToken(publicUser), accessTokenCookieOptions);
      res.locals.user = publicUser;
    }
  }

  next();
}
