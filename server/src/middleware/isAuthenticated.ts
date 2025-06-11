import { NextFunction, Request, Response } from "express";
import { signAccessToken } from "../services/auth.service";
import { findUserById } from "../services/user.service";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";
import { verifyJwt } from "../utils/token";
import { accessTokenCookieOptions } from "../constants/cookies";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken) {
      // Valid access token
      const { decoded } = verifyJwt(accessToken);

      if (decoded) {
        res.locals.user = decoded;
        return next();
      } else {
        res.status(401).send("Forbidden");
        return next(new Error("Not Signed in"));
      }
    }

    // No access token, check refresh token
    const { decoded: refresh } = refreshToken
      ? verifyJwt(refreshToken)
      : { decoded: null };

    if (!refresh) {
      // No valid refresh token, let next handle unauthenticated
      return next();
    }

    // Valid refresh token
    const user = await findUserById(refresh["session"], true);

    if (!user) {
      res.status(401).send("Could not find user with specified user Id.");
      return;
    }

    // Remove sensitive fields
    const userWithFieldsRemoved = removeFieldsFromObject(user, [
      "password",
      "email",
      "posts",
    ]);

    const newAccessToken = signAccessToken(userWithFieldsRemoved);

    if (newAccessToken) {
      // Set cookie & header with new access token
      res.setHeader("x-access-token", newAccessToken);

      res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
    }

    const result = verifyJwt(newAccessToken);
    res.locals.user = result.decoded;

    return next();
  } catch (error) {
    // Pass any error to the global error handler
    return next(error);
  }
}
