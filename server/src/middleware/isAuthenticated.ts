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
  const { accessToken, refreshToken } = req.cookies;
  if (accessToken) {
    // Valid access token
    const { decoded } = verifyJwt(accessToken, "accessTokenPublicKey");

    if (decoded) {
      res.locals.user = decoded;

      return next();
    } else if (!decoded || decoded === null) {
      res.status(401);
      return next(new Error("Not Signed in"));
    }
  } else if (!accessToken) {
    // Access token has expired
    const { decoded: refresh } = refreshToken
      ? verifyJwt(refreshToken, "refreshTokenPublicKey")
      : { decoded: null };

    if (!refresh) {
      // Refresh token has expired
      // User will need to log in/sign up
      return next();
    }
    // Valid refresh token
    if (refreshToken) {
      const user = await findUserById(refresh["session"], true);

      if (!user) {
        return res
          .status(401)
          .send("Could not find user with specified user Id.");
      }

      // Remove email and password fields before sending user back
      const userWithFieldsRemoved = removeFieldsFromObject(user, [
        "password",
        "email",
        "posts"
      ]);

      const newAccessToken = signAccessToken(userWithFieldsRemoved);

      if (newAccessToken) {
        // Set cookie & header with new access token
        res.setHeader("x-access-token", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          maxAge: 900000, // 15 mins
          httpOnly: true,
          domain: config.serverDomain,
          path: "/",
          sameSite: "none",
          secure: true,
        });
      }

      const result = verifyJwt(newAccessToken, "accessTokenPublicKey");

      res.locals.user = result.decoded;

      return next();
    }

    return next();
  }

  return next();
}
