import fs from "fs";

// Function to load secret from file or environment variables.
// This assumes envs have been mounted using dotenv or by docker
export const loadSecret = (filePath: string, envVarName: string): string => {
  if (fs.existsSync(filePath)) {
    try {
      return fs.readFileSync(filePath, "utf8").trim();
    } catch (err) {
      console.error(`Error reading secret file at ${filePath}:`, err);
    }
  }

  const envValue = process.env[envVarName];
  if (!envValue) {
    console.warn(`Warning: Secret not found for ${envVarName}`);
  }

  return envValue || "";
};
