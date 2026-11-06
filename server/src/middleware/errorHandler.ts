import { Request, Response, NextFunction } from "express";
import { isDevelopment } from "../utils/env";

export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error("Request failed:", err);

  res.status(status).json({
    message: status === 413 ? "Request body is too large."
      : status === 400 ? "Invalid request body."
      : "Request failed.",
    stack: isDevelopment && status === 500 ? err.stack : undefined,
  });
};
