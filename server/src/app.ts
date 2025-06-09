import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/config";
import router from "./routes";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = (): Application => {
  const app: Application = express();

  app.use(
    cors({
      origin: config.clientURL,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "50mb" }));

  app.use(isAuthenticated);

  app.use(router);

  app.use(errorHandler);

  return app;
};
