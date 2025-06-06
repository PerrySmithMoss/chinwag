import { Request, Response, NextFunction } from "express";
import { isDevelopment } from "../utils/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (isDevelopment) {
    console.error("Error:", err);
  }

  res.status(500).json({
    message: "Internal server error",
    ...(isDevelopment && { error: err.message }),
  });
};
