import { NextFunction, Request, Response } from "express";

import { Cookies } from "../types/types";

import { verifyJwt } from "../utils/token";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = (req.headers.authorization || "").replace(
    /^Bearer\s/,
    ""
  );

  if (!accessToken) {
    return next();
  }

  //   const token = verifyAccessToken(req.cookies[Cookies.AccessToken]);
  const token = verifyJwt(accessToken, "accessTokenPublicKey");

  if (!token) {
    res.status(401);
    return next(new Error("Not Signed in"));
  }

  res.locals.user = token;

  next();
}
