import { User } from "@prisma/client";
import { signJwt } from "../utils/token";

export async function signRefreshToken(userId: number ) {
    const refreshToken = signJwt(
      {
        session: userId,
      },
      "refreshTokenPrivateKey",
      {
        expiresIn: "1y",
      }
    );
  
    return refreshToken;
  }
  
  export function signAccessToken(user: Partial<User>) {
    const accessToken = signJwt(user, "accessTokenPrivateKey", {
      expiresIn: "15m",
    });
  
    return accessToken;
  }