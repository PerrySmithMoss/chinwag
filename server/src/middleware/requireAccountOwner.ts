import { NextFunction, Request, Response } from "express";
import { parseUserId } from "../utils/userId";

export function requireAccountOwner(req: Request, res: Response, next: NextFunction) {
  const id = parseUserId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Invalid account ID." });
    return;
  }

  if (id !== res.locals.user.id) {
    res.sendStatus(403);
    return;
  }

  next();
}
