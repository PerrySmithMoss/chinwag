import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/config";
import router from "./routes";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = (): Application => {
  const app: Application = express();
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: config.clientURL,
      credentials: true,
    })
  );
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && !["GET", "HEAD", "OPTIONS"].includes(req.method)
        && origin !== config.clientURL && origin !== config.serverURL) {
      res.sendStatus(403);
      return;
    }
    res.set("Cache-Control", "no-store");
    next();
  });
  // Public process-liveness check for external monitors; no auth or DB work.
  // Express also serves HEAD using this GET handler, without a response body.
  app.get("/healthz", (_req, res) => {
    res.status(200).set("Cache-Control", "no-store").json({ status: "ok" });
  });

  app.use(cookieParser());
  app.use(express.json({ limit: "16kb" }));

  app.use(isAuthenticated);

  app.use(router);

  app.use(errorHandler);

  return app;
};
