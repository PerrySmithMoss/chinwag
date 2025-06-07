import prisma from "../lib/prisma";
import { hash, verify, argon2id } from "argon2";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";
import { User as PrismaUser } from "@prisma/client";

type CreateUserInput = Pick<
  PrismaUser,
  "email" | "password" | "firstName" | "lastName" | "username"
>;

export async function createUser(userInput: CreateUserInput) {
  const hashedPassword = await hash(userInput.password, {
    type: argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  const user = await prisma.user.create({
    data: {
      ...userInput,
      password: hashedPassword,
      profile: {
        create: {},
      },
    },
  });

  return user;
}

export async function findUserByEmail(
  email: string,
  includeRelations: boolean
) {
  if (includeRelations === true) {
    return await prisma.user.findUnique({
      where: { email: email },
      include: { profile: true },
    });
  } else {
    return await prisma.user.findUnique({
      where: { email: email },
    });
  }
}

export async function getAllUsers(cursor?: number) {
  if (cursor) {
    const users = await prisma.user.findMany({
      take: 2,
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        username: true,
        profile: true,
      },
      where: {
        id: {
          gt: cursor,
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return users;
  } else {
    const users = await prisma.user.findMany({
      take: 2,
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        username: true,
        profile: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return users;
  }
}

export async function findUserById(userId: number, includeRelations: boolean) {
  if (includeRelations === true) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
      // select: {
      //   id: true,
      //   createdAt: true,
      //   firstName: true,
      //   lastName: true,
      //   username: true,
      //   posts: true,
      //   profile: true,
      // },
    });
  } else {
    return await prisma.user.findFirst({
      where: { id: userId },
    });
  }
}

export async function findUserByUsername(
  username: string,
  includeRelations: boolean,
  cursor?: string
) {
  if (cursor) {
    if (includeRelations === true) {
      const res = await prisma.user.findMany({
        take: 10,
        where: {
          username: { contains: username },
          AND: [
            {
              username: {
                gt: cursor,
              },
            },
          ],
        },
        include: { profile: true },
        orderBy: {
          username: "asc",
        },
      });

      const removeUnwantedFieldsFromEachUser = res.map((user) => {
        return removeFieldsFromObject(user, ["password", "email"]);
      });

      return removeUnwantedFieldsFromEachUser;
    } else {
      const res = await prisma.user.findMany({
        where: { username },
      });

      const removeUnwantedFieldsFromEachUser = res.map((user) => {
        removeFieldsFromObject(user, ["password", "email"]);
      });

      return removeUnwantedFieldsFromEachUser;
    }
  } else {
    if (includeRelations === true) {
      const res = await prisma.user.findMany({
        take: 10,
        where: { username: { contains: username } },
        include: { profile: true },
        orderBy: {
          username: "asc",
        },
      });

      const removeUnwantedFieldsFromEachUser = res.map((user) => {
        return removeFieldsFromObject(user, ["password", "email"]);
      });

      return removeUnwantedFieldsFromEachUser;
    } else {
      const res = await prisma.user.findMany({
        where: { username },
      });

      const removeUnwantedFieldsFromEachUser = res.map((user) => {
        removeFieldsFromObject(user, ["password", "email"]);
      });

      return removeUnwantedFieldsFromEachUser;
    }
  }
}

export async function validatePassword(
  userPassword: string,
  userInput: string
) {
  return await verify(userPassword, userInput);
}

export async function getAllUsersExceptSpecifiedUser(userId: number) {
  return await prisma.user.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
    select: {
      id: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      username: true,
      profile: true,
    },
  });
}

export async function updateUserWithSpecifiedData(
  userId: number,
  data: Partial<PrismaUser>
) {
  return await prisma.user.update({
    where: { id: userId },
    data: data,
  });
}

export async function deleteUserProfile(userId: number, async: boolean) {
  if (async === true) {
    return await prisma.profile.delete({
      where: { id: userId },
    });
  } else {
    prisma.profile.delete({
      where: { id: userId },
    });
  }
}

export async function deleteUser(userId: number, async: boolean) {
  if (async === true) {
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } else {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}

export async function updateUsersAvatar(
  userId: number,
  avatar: string,
  imageId: string
) {
  return await prisma.user.update({
    where: { id: userId },
    data: { profile: { update: { avatar: avatar, avatarId: imageId } } },
    include: { profile: true },
  });
}
