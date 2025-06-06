import { NextFunction, Request, Response } from "express";

export function requireUser(_req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user;

  if (!user) {
    res.status(403).send(null);
  }

  return next();
}
