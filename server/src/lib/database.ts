import prisma from "./prisma";

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
  } catch (err) {
    console.error("❌ Database disconnection failed:", err);
  }
};
