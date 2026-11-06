import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { config } from "../config/config";

export default new PrismaClient({
  adapter: new PrismaPg({
    connectionString: config.databaseURL,
    connectionTimeoutMillis: 5_000,
  }),
});
