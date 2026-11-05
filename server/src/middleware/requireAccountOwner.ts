import { NextFunction, Request, Response } from "express";

export function requireAccountOwner(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  if (!/^[1-9][0-9]*$/.test(req.params.id) || !Number.isSafeInteger(id)) {
    res.status(400).json({ message: "Invalid account ID." });
    return;
  }

  if (id !== res.locals.user.id) {
    res.sendStatus(403);
    return;
  }

  next();
}
