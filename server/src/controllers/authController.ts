import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { signAccessToken, signRefreshToken } from "../services/auth.service";
import {
  findUserByEmail,
  findUserById,
  validatePassword,
} from "../services/user.service";
import { verifyJwt } from "../utils/token";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";

export async function createSessionHandler(req: Request, res: Response) {
  const message = "Invalid email or password";
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(400).json({ message: message });
    return;
  }

  const isValidUser = await validatePassword(user.password, password);

  if (!isValidUser) {
    res.status(400).json({ message: message });
  }

  // Remove email and password fields before sending user back
  const userWithFieldsRemoved = removeFieldsFromObject(user, [
    "password",
    "email",
  ]);

  // sign a access token
  const accessToken = signAccessToken(userWithFieldsRemoved);

  // sign a refresh token
  const refreshToken = await signRefreshToken(userWithFieldsRemoved.id);

  // Set tokens as cookies
  res.cookie("accessToken", accessToken, {
    maxAge: 900000, // 15 mins
    httpOnly: true,
    domain: "localhost",
    path: "/",
    sameSite: "strict",
    secure: false,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 3.154e10, // 1 year
    httpOnly: true,
    domain: "localhost",
    path: "/",
    sameSite: "strict",
    secure: false,
  });

  // send the tokens
  return res.status(200).send({
    accessToken,
    refreshToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = req.header("x.refresh");

  if (!refreshToken) {
    return res.status(401).send("No refresh token available");
  }

  const {decoded} = verifyJwt(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded || decoded === null) {
    return res.status(401).send("Could not refresh access token");
  }

  const user = await findUserById(decoded.session, true);

  if (!user) {
    return res.status(401).send("Could not refresh access token");
  }

  // Remove email and password fields before sending user back
  const userWithFieldsRemoved = removeFieldsFromObject(user, [
    "password",
    "email",
  ]);

  const accessToken = signAccessToken(userWithFieldsRemoved);

  return res.send({ accessToken });
}
