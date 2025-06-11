import dotenv from "dotenv";

export enum NodeEnv {
  Development = "development",
  Production = "production",
  Test = "test",
}

export const getNodeEnv = (): NodeEnv =>
  (process.env.NODE_ENV as NodeEnv) || NodeEnv.Development;

export const isProduction = getNodeEnv() === "production";
export const isDevelopment = getNodeEnv() === "development";
export const isTest = getNodeEnv() === "test";

export const loadEnvironment = () => {
  const path = isProduction ? ".env.production" : isTest ? ".env.test" : ".env";

  dotenv.config({ path });
  dotenv.config({ path: ".env.local", override: true }); // override any previous values
};

export const getRequiredEnv = (val: string | undefined | null): string => {
  if (!val) throw new Error(`Missing environment variable: ${val}`);
  return val;
};
