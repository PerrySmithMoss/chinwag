import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  try {
    let registeredUser;
    try {
      //generate new password
      const hashedPassword = await argon2.hash(req.body.password);
      registeredUser = await prisma.user.create({
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          profile: {
            create: {},
          },
        },
      });
    } catch (err) {
      res.status(500).json(err);
    }
    res.status(200).json(registeredUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      include: { posts: true, profile: true },
    });
    if (!user) {
      res
        .status(400)
        .json({ message: "No user matches the given credentails" });
      return;
    }

    const validUser = await argon2.verify(user.password, req.body.password);
    if (!validUser) {
      res.status(400).json({ message: "The given password is incorrect" });
    }

    // ctx.req.session.userId = user.id;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};
