import { getRequiredEnv, loadEnvironment } from "../utils/env";
import { loadSecret } from "../utils/loadSecret";

loadEnvironment();

type Config = {
  serverPort: number;
  serverDomain: string;
  serverURL?: string;
  clientURL?: string;
  accessTokenTtl: string;
  refreshTokenTtl: string;
  accessTokenCookieName: string;
  refreshTokenCookieName: string;
  databaseURL: string;
  jwtSecret: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
};

export const config: Config = {
  serverPort: Number(process.env.PORT) || 5560,
  serverDomain: process.env.SERVER_DOMAIN || "localhost",
  serverURL: process.env.SERVER_URL || "https://localhost:5560",
  clientURL: process.env.CLIENT_URL || "https://localhost:3000",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken",
  refreshTokenCookieName:
    process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken",
  databaseURL: getRequiredEnv(
    loadSecret("/run/secrets/chinwag_database_url", "DATABASE_URL")
  ),
  jwtSecret: getRequiredEnv(
    loadSecret("/run/secrets/chinwag_jwt_secret", "JWT_SECRET")
  ),
  cloudinaryCloudName: getRequiredEnv(
    loadSecret(
      "/run/secrets/chinwag_cloudinary_cloud_name",
      "CLOUDINARY_CLOUD_NAME"
    )
  ),
  cloudinaryApiKey: getRequiredEnv(
    loadSecret("/run/secrets/chinwag_cloudinary_api_key", "CLOUDINARY_API_KEY")
  ),
  cloudinaryApiSecret: getRequiredEnv(
    loadSecret(
      "/run/secrets/chinwag_cloudinary_api_secret",
      "CLOUDINARY_API_SECRET"
    )
  ),
};
