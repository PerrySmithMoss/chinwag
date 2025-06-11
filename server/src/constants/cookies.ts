import { CookieOptions } from "express";
import { isDevelopment, isProduction } from "../utils/env";

export const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  httpOnly: true,
  path: "/",

  /* For same parent domain (e.g., api.example.com and app.example.com)-
    use the parent domain with a leading dot (.example.com). 
    In my case, my client and server are currently on separate domains 
    so the domain option is being conditionally added. 
   */
  ...(isDevelopment ? { domain: "localhost" } : {}), // No domain property in production

  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 6.048e8, // 7 days
};
