import { Prisma } from "@prisma/client";
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
  validatePassword,
} from "../services/user.service";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";
import { config } from "../config/config";
import * as Cloudinary from "cloudinary";
import { CreateUserInput, updateProfileSchema } from "../schema/User.schema";
import { removeCharsFromString } from "../utils/removeCharsFromString";

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) => {
  const body = req.body;
  try {
    const registeredUser = await createUser(body);

    // Remove email and password fields before sending user back
    const userWithFieldsRemoved = removeFieldsFromObject(registeredUser, [
      "password",
      "email",
    ]);

    res.status(200).json(userWithFieldsRemoved);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).send("Account already exists");
      return;
    }
    res.status(409).json(err);
  }
};

export const loginUserHandler = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const user = await findUserByEmail(body.email, true);

    if (!user) {
      res
        .status(400)
        .json({ message: "The email or password provided is incorrect." });
      return;
    }

    const isValidUser = await validatePassword(user.password, body.password);

    if (!isValidUser) {
      res
        .status(400)
        .json({ message: "The email or password provided is incorrect." });
    }

    // Remove email and password fields before sending user back
    const userWithFieldsRemoved = removeFieldsFromObject(user, [
      "password",
      "email",
    ]);

    // ctx.req.session.userId = user.id;

    return res.status(200).json(userWithFieldsRemoved);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

export const allUsersHandler = async (req: Request, res: Response) => {
  try {
    const { cursor } = req.query;

    const users = await getAllUsers(parseInt(cursor as string));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserHandler = async (req: Request, res: Response) => {
  const params = req.params;
  try {
    const userId = parseInt(params.id);

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
    res.status(500).json(err);
  }
};

export const getUserFriendsHandler = async (req: Request, res: Response) => {
  const params = req.params;
  try {
    const userId = parseInt(params.id);

    const users = await getAllUsersExceptSpecifiedUser(userId);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
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
    res.status(500).json(err);
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
    res.status(500).json(err);
  }
};

export const searchForUserByUsernameHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const username = req.params.username;

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
    res.status(500).json(err);
  }
};

export const searchForUserByEmailHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const email = req.params.email;

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
      "posts",
      "createdAt",
      "updatedAt",
    ]);

    res.status(200).json(userWithFieldsRemoved);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const uploadUserAvatarHandler = async (req: Request, res: Response) => {
  try {
    const { signature, public_id, image_url, version } = req.body;
    // based on the public_id and the version that the (potentially malicious) user is submitting...
    // we can combine those values along with our SECRET key to see what we would expect the signature
    // to be if it was innocent / valid / actually coming from Cloudinary
    const expectedSignature = Cloudinary.v2.utils.api_sign_request(
      { public_id: public_id, version: version },
      config.cloudinaryApiSecret as string
    );

    // We can trust the visitor's data if their signature is what we'd expect it to be...
    // Because without the SECRET key there's no way for someone to know what the signature should be...
    if (expectedSignature === signature) {
      const userId = parseInt(req.params.id);

      // First identify whether the user exists or not
      const validUser = await findUserById(userId, false);

      if (!validUser) {
        res.status(400).json({
          message: "Could not find a user matching the given ID.",
        });
        return;
      }

      const imageUrl = image_url;

      const publicImageId = removeCharsFromString(
        public_id,
        "chinwag/avatars/"
      );

      // Store the users avatar url in database
      const updatedUser = await updateUsersAvatar(
        userId,
        imageUrl,
        publicImageId
      );

      const userWithFieldsRemoved = removeFieldsFromObject(updatedUser, [
        "password",
        "email",
      ]);

      res.status(200).json(userWithFieldsRemoved);
    } else {
      res.status(401).json({ error: "Unauthorised signature." });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
