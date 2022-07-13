import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  getAllUsersExceptSpecifiedUser,
  updateUserWithSpecifiedData,
} from "../services/user.service";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";

const prisma = new PrismaClient();

export const createUserHandler = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const registeredUser = await createUser(body);

    // Remove email and password fields before sending user back
    const userWithFieldsRemoved = removeFieldsFromObject(registeredUser, [
      "password",
      "email",
    ]);

    return res.status(200).json(userWithFieldsRemoved);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).send("Account already exists");
    }
    return res.status(500).json(err);
  }
};

export const loginUserHandler = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const user = await findUserByEmail(body.password);

    if (!user) {
      res
        .status(400)
        .json({ message: "The email or password provided is incorrect." });
      return;
    }

    const validUser = await argon2.verify(user.password, body.password);

    if (!validUser) {
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
    const users = await getAllUsers();

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserHandler = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const userId = parseInt(body.id);

    const user = await findUserById(userId, true);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserFriendsHandler = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const userId = parseInt(body.id);

    const user = await getAllUsersExceptSpecifiedUser(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const userId = parseInt(req.params.id);

    // First identify whether the user exists or not
    const validUser = await findUserById(userId, false);

    if (!validUser) {
      res.status(400).json({
        message: "Could not find a user matching the given ID.",
      });
      return;
    }

    const updatedUser = await updateUserWithSpecifiedData(userId, body);

    res.status(201).json({ updatedUser });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // First identify whether the user exists or not
    const validUser = await findUserById(userId, false);

    if (!validUser) {
      res.status(400).json({
        message: "Could not find a user matching the given ID.",
      });
      return;
    }

    // // delete the user's profile
    // const userProfile = prisma.profile.delete({
    //   where: { id: userId },
    // });

    // if (!userProfile) {
    //   res
    //     .status(400)
    //     .json({ message: "No profile was found with the given user ID" });
    //   return;
    // }

    // // delete the user's posts
    // const userPosts: any = prisma.post.deleteMany({
    //   where: {
    //     authorId: userId,
    //   },
    // });

    // if (!userPosts) {
    //   res
    //     .status(400)
    //     .json({ message: "No posts were found with the given user ID" });
    //   return;
    // }

    // // Delete the users messages
    // const messages = prisma.message.deleteMany({
    //   where: {
    //     OR: [
    //       {
    //         senderId: userId,
    //         receiverId: userId,
    //       },
    //     ],
    //   },
    // });

    // if (!messages) {
    //   res
    //     .status(400)
    //     .json({ message: "No messages were found with the given user ID" });
    //   return;
    // }

    // Delete the user
    const user = deleteUser(userId, false);

    if (!user) {
      res.status(400).json({ message: "No user was found with the given ID" });
      return;
    }

    const transaction = await prisma.$transaction(async (prisma) => {
      return user;
    });

    if (!transaction) {
      res.status(400).json({
        message: "There was a problem while attempting to delete the user.",
      });
      return;
    }

    res.status(201).json({ message: "User has been successfully deleted." });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
