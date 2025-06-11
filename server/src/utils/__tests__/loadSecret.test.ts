import fs from "fs";
import { loadSecret } from "../loadSecret";

jest.mock("fs");

describe("loadSecret", () => {
  const mockExistsSync = fs.existsSync as jest.Mock;
  const mockReadFileSync = fs.readFileSync as jest.Mock;

  const filePath = "/fake/path/secret.txt";
  const envVarName = "SECRET_ENV";

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env[envVarName];
  });

  it("should return secret from file if it exists", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue("  fileSecret  ");

    const secret = loadSecret(filePath, envVarName);
    expect(secret).toBe("fileSecret");
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, "utf8");
  });

  it("should return env var if file read fails", () => {
    mockExistsSync.mockReturnValue(true);
    const error = new Error("Failed to read file");
    mockReadFileSync.mockImplementation(() => {
      throw error;
    });
    process.env[envVarName] = "envSecret";

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const secret = loadSecret(filePath, envVarName);
    expect(secret).toBe("envSecret");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error reading secret file at ${filePath}:`,
      error
    );

    consoleErrorSpy.mockRestore();
  });

  it("should return env var if file does not exist", () => {
    mockExistsSync.mockReturnValue(false);
    process.env[envVarName] = "envSecret";

    const secret = loadSecret(filePath, envVarName);
    expect(secret).toBe("envSecret");
  });

  it("should return empty string and warn if no secret found", () => {
    console.warn = jest.fn();
    mockExistsSync.mockReturnValue(false);

    const secret = loadSecret(filePath, envVarName);
    expect(secret).toBe("");
    expect(console.warn).toHaveBeenCalledWith(
      `Warning: Secret not found for ${envVarName}`
    );
  });
});
