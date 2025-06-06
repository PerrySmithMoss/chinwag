export const getNodeEnv = () => process.env.NODE_ENV;

export const isProduction = getNodeEnv() === "production";
export const isDevelopment = getNodeEnv() === "development";
