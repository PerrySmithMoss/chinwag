import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteUserPosts(userId: number, async: boolean) {
  if (async === true) {
    return await prisma.post.deleteMany({
      where: {
        authorId: userId,
      },
    });
  } else {
    prisma.post.deleteMany({
      where: {
        authorId: userId,
      },
    });
  }
}
