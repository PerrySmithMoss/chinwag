import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { signAccessToken, signRefreshToken, signSocketTicket, verifyRefreshToken } from "../services/auth.service";
import { createUser, findUserByEmail, findUserById, validatePassword } from "../services/user.service";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";
import { config } from "../config/config";
import { loginUserSchema } from "../schema/Auth.schema";
import { createUserSchema } from "../schema/User.schema";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../constants/cookies";

function setSessionCookies(res: Response, user: Parameters<typeof signAccessToken>[0]) {
  res.cookie(config.accessTokenCookieName, signAccessToken(user), accessTokenCookieOptions);
  res.cookie(config.refreshTokenCookieName, signRefreshToken(user.id), refreshTokenCookieOptions);
}

export async function registerSessionHandler(req: Request, res: Response) {
  const body = createUserSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid registration fields." });
    return;
  }

  try {
    const user = await createUser(body.data);
    setSessionCookies(res, removeFieldsFromObject(user, ["password", "email"]));
    res.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(409).json({ error: "An account already exists with that email or username." });
      return;
    }

    throw error;
  }
}

export async function createSessionHandler(req: Request, res: Response) {
  const body = loginUserSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid login fields." });
    return;
  }

  const { email, password } = body.data;
  const user = await findUserByEmail(email, true);
  if (!user || !(await validatePassword(user.password, password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  setSessionCookies(res, removeFieldsFromObject(user, ["password", "email"]));
  res.json({ success: true });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const token = req.cookies[config.refreshTokenCookieName] ?? req.header("x.refresh");
  const userId = verifyRefreshToken(token);
  const user = userId === null ? null : await findUserById(userId, true);
  if (!user) {
    res.status(401).json({ error: "Could not refresh access token." });
    return;
  }

  const publicUser = removeFieldsFromObject(user, ["password", "email"]);
  res.cookie(config.accessTokenCookieName, signAccessToken(publicUser), accessTokenCookieOptions);
  res.json({ success: true });
}

export function createSocketTicketHandler(_req: Request, res: Response) {
  res.set("Cache-Control", "no-store").json({ ticket: signSocketTicket(res.locals.user.id) });
}

export function deleteUserSessionHandler(_req: Request, res: Response) {
  const { httpOnly, path, domain, sameSite, secure } = accessTokenCookieOptions;
  const options = { httpOnly, path, domain, sameSite, secure };
  res.clearCookie(config.accessTokenCookieName, options);
  res.clearCookie(config.refreshTokenCookieName, options);
  res.json({ success: true });
}
