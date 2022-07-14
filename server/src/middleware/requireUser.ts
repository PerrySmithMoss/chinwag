import { NextFunction, Request, Response } from "express";

import { verifyJwt } from "../utils/token";

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user;

  if (!user) {
    return res
      .sendStatus(403)
    //   .send({ error: "You must be logged in to view this resource." });
  }

  next();
}
