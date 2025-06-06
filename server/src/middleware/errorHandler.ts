import { Request, Response, NextFunction } from "express";
import { isDevelopment } from "../utils/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err);

  const status = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    message: err.message || "Internal Server Error",
    // optionally, include stack trace in dev mode
    stack: isDevelopment ? err.stack : undefined,
  });
};
