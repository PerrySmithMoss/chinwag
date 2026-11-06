import { Prisma } from "../generated/prisma/client";
import { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  getAllUsers,
  getAllUsersExceptSpecifiedUser,
  updateUsersAvatar,
  updateUserWithSpecifiedData,
} from "../services/user.service";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";
import { config } from "../config/config";
import { v2 as cloudinary } from "cloudinary";
import { number, object, string } from "zod";
import { createUserSchema, updateProfileSchema } from "../schema/User.schema";
import { parseUserId } from "../utils/userId";
import { avatarPublicId } from "./images.controller";

export async function createUserHandler(req: Request, res: Response) {
  const body = createUserSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid registration fields." });
    return;
  }

  try {
    const user = await createUser(body.data);
    res.json(removeFieldsFromObject(user, ["password", "email"]));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(409).json({ error: "An account already exists with that email or username." });
      return;
    }

    throw error;
  }
}

export const allUsersHandler = async (req: Request, res: Response) => {
  try {
    const { cursor } = req.query;

    const users = await getAllUsers(parseInt(cursor as string));

    res.status(200).json(users);
  } catch (err) {
    throw err;
  }
};

export const getUserHandler = async (req: Request, res: Response) => {
  const params = req.params;
  try {
    const userId = parseUserId(params.id);
    if (userId === null) {
      res.sendStatus(400);
      return;
    }

    const user = await findUserById(userId, true);

    if (!user) {
      res
        .status(400)
        .json({ message: "The email or password provided is incorrect." });
      return;
    }

    const userWithFieldsRemoved = removeFieldsFromObject(user, [
      "password",
      "email",
    ]);

    res.status(200).json(userWithFieldsRemoved);
  } catch (err) {
    throw err;
  }
};

export const getUserFriendsHandler = async (req: Request, res: Response) => {
  const params = req.params;
  try {
    const userId = parseUserId(params.id);
    if (userId === null) {
      res.sendStatus(400);
      return;
    }

    const users = await getAllUsersExceptSpecifiedUser(userId);
    res.status(200).json(users);
  } catch (err) {
    throw err;
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const profile = updateProfileSchema.safeParse(req.body);
  if (!profile.success) {
    res.status(400).json({ message: "Invalid profile fields." });
    return;
  }

  try {
    const updatedUser = await updateUserWithSpecifiedData(res.locals.user.id, profile.data);
    const publicUser = removeFieldsFromObject(updatedUser, ["password", "email"]);
    res.status(201).json(publicUser);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(400).json({ message: "No user was found with the given ID." });
      return;
    }
    res.status(500).json({ message: "Could not update the account." });
  }
};

export const deleteUserHandler = async (_req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    await deleteUser(userId);
    res.status(201).json({ message: `User ${userId} has successfully been deleted.` });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(400).json({ message: "No user was found with the given ID." });
      return;
    }
    res.status(500).json({ message: "Could not delete the account." });
  }
};

export const getCurrentUserHandler = async (_req: Request, res: Response) => {
  try {
    if (!res.locals.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    res.send(res.locals.user);
  } catch (err) {
    throw err;
  }
};

export const getCurrentLoggedInUserHandler = async (
  _req: Request,
  res: Response
) => {
  try {
    const userId = res.locals.user.id;

    const user = await findUserById(userId, true);

    if (!user) {
      res
        .status(400)
        .json({ message: "The email or password provided is incorrect." });
      return;
    }

    const userWithFieldsRemoved = removeFieldsFromObject(user, [
      "password",
      "email",
    ]);

    res.status(200).json(userWithFieldsRemoved);
  } catch (err) {
    throw err;
  }
};

export const searchForUserByUsernameHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const username = req.params.username;
    if (typeof username !== "string" || username.length > 100) {
      res.sendStatus(400);
      return;
    }

    const { cursor } = req.query;

    const users = await findUserByUsername(username, true, cursor as string);

    if (!users) {
      res.status(400).json({
        message: "There is no user which matches the specified username.",
      });
      return;
    }

    res.status(200).json(users);
  } catch (err) {
    throw err;
  }
};

export const searchForUserByEmailHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const email = req.params.email;
    if (typeof email !== "string" || email.length > 256) {
      res.sendStatus(400);
      return;
    }

    const user = await findUserByEmail(email, true);

    if (!user) {
      // res.status(400).json({
      //   error: "There is no user with the specified email.",
      // });
      res.sendStatus(400);
      return;
    }

    // Remove email and password fields before sending user back
    const userWithFieldsRemoved = removeFieldsFromObject(user, [
      "password",
      "email",
      "createdAt",
      "updatedAt",
    ]);

    res.status(200).json(userWithFieldsRemoved);
  } catch (err) {
    throw err;
  }
};

const avatarUploadSchema = object({
  public_id: string(),
  signature: string(),
  image_url: string(),
  version: number().int().positive(),
});

export async function uploadUserAvatarHandler(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const upload = avatarUploadSchema.safeParse(req.body);
  if (!upload.success) {
    res.status(400).json({ error: "Invalid avatar upload." });
    return;
  }

  const { public_id, version, signature, image_url } = upload.data;
  const publicId = avatarPublicId(userId);
  const imagePrefix = `https://res.cloudinary.com/${config.cloudinaryCloudName}/image/upload/v${version}/${publicId}.`;
  if (public_id !== publicId || !image_url.startsWith(imagePrefix)
      || !/^[a-z0-9]+$/i.test(image_url.slice(imagePrefix.length))) {
    res.status(400).json({ error: "Invalid avatar upload." });
    return;
  }

  const expectedSignature = cloudinary.utils.api_sign_request(
    { public_id, version },
    config.cloudinaryApiSecret
  );
  if (expectedSignature !== signature) {
    res.status(401).json({ error: "Unauthorised signature." });
    return;
  }

  const user = await updateUsersAvatar(userId, image_url, `user-${userId}`);
  res.json(removeFieldsFromObject(user, ["password", "email"]));
}
