import { NextFunction, Request, Response } from "express";
import { signAccessToken } from "../services/auth.service";
import { findUserById } from "../services/user.service";

import { Cookies } from "../types/types";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";

import { verifyJwt } from "../utils/token";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken =
    (req.headers.authorization || "").replace(/^Bearer\s/, "") ||
    req.cookies.accessToken;

  const refreshToken = req.cookies.refreshToken || req.header("x-refresh");

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");

  if (decoded) {
    res.locals.user = decoded;
    return next();
  } else if (!decoded|| decoded === null) {
    res.status(401);
    return next(new Error("Not Signed in"));
  }

  if (expired && refreshToken) {
    const user = await findUserById(decoded['session'], true);

    if (!user) {
      return res.status(401).send("Could not refresh access token");
    }

    // Remove email and password fields before sending user back
    const userWithFieldsRemoved = removeFieldsFromObject(user, [
      "password",
      "email",
    ]);

    const newAccessToken = signAccessToken(userWithFieldsRemoved);

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);

      res.cookie("accessToken", newAccessToken, {
        maxAge: 900000, // 15 mins
        httpOnly: true,
        domain: "localhost",
        path: "/",
        sameSite: "strict",
        secure: false,
      });
    }

    const result = verifyJwt(newAccessToken, "accessTokenPublicKey");

    res.locals.user = result.decoded;
    return next();
  }

  return next();
}
