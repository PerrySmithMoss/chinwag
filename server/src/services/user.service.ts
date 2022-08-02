import prisma from "../lib/prisma";
import { hash } from "argon2";
import argon2 from "argon2";
import { removeFieldsFromObject } from "../utils/removeFieldsFromObject";

type User = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
};

export async function createUser(userInput: User) {
  const hashedPassword = await hash(userInput.password);

  return await prisma.user.create({
    data: {
      firstName: userInput.firstName,
      lastName: userInput.lastName,
      username: userInput.username,
      email: userInput.email,
      password: hashedPassword,
      profile: {
        create: {},
      },
    },
  });
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
      take: 20,
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
        createdAt: "asc",
      },
    });

    return users;
  } else {
    const users = await prisma.user.findMany({
      take: 20,
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        username: true,
        profile: true,
      },
      orderBy: {
        createdAt: "asc",
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
  includeRelations: boolean
) {
  if (includeRelations === true) {
    const res = await prisma.user.findMany({
      where: { username: { contains: username } },
      include: { profile: true },
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

export async function validatePassword(
  userPassword: string,
  userInput: string
) {
  return await argon2.verify(userPassword, userInput);
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
  data: Partial<User>
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

export async function updateUsersAvatar(userId: number, avatar: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { profile: { update: { avatar } } },
    include: { profile: true },
  });
}

// export async function updateUsersAvatar(userId: number, avatar: string) {
//   return await prisma.profile.update({
//     where: { id: userId },
//     data: { avatar },
//   });
// }
