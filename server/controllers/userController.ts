import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const allUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        posts: true,
        profile: true,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserFriends = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findMany({
      where: 
      { 
        NOT: { 
          id: userId 
        }
      },
      include: {
        posts: true,
        profile: true,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // First identify whether the user exists or not
    const validUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!validUser) {
      res.status(400).json({
        message: "Could not find a user matching the given ID.",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: req.body,
    });

    res.status(201).json({ updatedUser });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // First identify whether the user exists or not
    const validUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!validUser) {
      res.status(400).json({
        message: "Could not find a user matching the given ID.",
      });
      return;
    }

    // delete the user's posts
    const deleteUserPosts = prisma.post.deleteMany({
      where: {
        authorId: userId,
      },
    });
    if (!deleteUserPosts) {
      res
        .status(400)
        .json({ message: "No posts were found with the given user ID" });
      return;
    }

    // delete the user's profile
    const deleteUserProfile = prisma.profile.delete({
      where: {
        userId: userId,
      },
    });
    if (!deleteUserProfile) {
      res
        .status(400)
        .json({ message: "No profile was found with the given user ID" });
      return;
    }

    // Delete the user
    const user = prisma.user.delete({
      where: { id: userId },
    });

    if (!user) {
      res.status(400).json({ message: "No user was found with the given ID" });
      return;
    }

    const transaction = await prisma.$transaction([
      deleteUserProfile,
      deleteUserPosts,
      user,
    ]);

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
