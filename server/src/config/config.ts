import dotenv from "dotenv";

dotenv.config();

export const config = {
  serverPort: process.env.PORT || 5560,
  serverDomain: process.env.SERVER_DOMAIN || "localhost",
  serverURL: process.env.SERVER_URL,

  clientURL: process.env.CLIENT_URL,

  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken",
  refreshTokenCookieName:
    process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken",

  databaseURL: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET || "",

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
