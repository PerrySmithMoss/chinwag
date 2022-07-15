import { NextFunction, Request, Response } from "express";
import { config } from "../../config/config";
import { signAccessToken } from "../services/auth.service";
import { findUserById } from "../services/user.service";
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

  const refreshToken = req.header("x-refresh") || req.cookies.refreshToken;

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");

  // Valid access token
  if (decoded) {
    res.locals.user = decoded;
    return next();
  } else if (!decoded || decoded === null) {
    res.status(401);
    return next(new Error("Not Signed in"));
  }

  // Expired access token but valid refresh token
  if (expired && refreshToken) {
    const user = await findUserById(decoded["session"], true);

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
        domain: config.serverDomain,
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
