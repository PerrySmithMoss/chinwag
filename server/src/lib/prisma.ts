import { PrismaClient } from "@prisma/client";
import { isProduction } from "../utils/env";

let prisma: PrismaClient;

if (isProduction) {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}
export default prisma;
