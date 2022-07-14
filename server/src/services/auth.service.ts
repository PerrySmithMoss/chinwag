import { User } from "@prisma/client";
import prisma from "../lib/prisma";
import { signJwt } from "../utils/token";

export async function signRefreshToken(userId: number ) {
    // const session = await createSession({
    //   userId,
    // });
  
    const refreshToken = signJwt(
      {
        session: userId,
      },
      "refreshTokenPrivateKey",
      {
        expiresIn: "1d",
      }
    );
  
    return refreshToken;
  }
  
  export function signAccessToken(user: Partial<User>) {
    // const payload = omit(user.toJSON(), privateFields);
  
    const accessToken = signJwt(user, "accessTokenPrivateKey", {
      expiresIn: "15m",
    });
  
    return accessToken;
  }