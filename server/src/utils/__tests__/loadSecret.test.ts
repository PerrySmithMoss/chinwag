import assert from "node:assert/strict";
import fs from "node:fs";
import { afterEach, describe, it } from "node:test";
import { loadSecret } from "../loadSecret";

describe("loadSecret", () => {
  const filePath = "/fake/path/secret.txt";
  const envVarName = "SECRET_ENV";

  afterEach(() => {
    delete process.env[envVarName];
  });

  it("returns the trimmed secret from the file if it exists", ({ mock }) => {
    mock.method(fs, "existsSync", () => true);
    const read = mock.method(fs, "readFileSync", () => "  fileSecret  ");

    assert.equal(loadSecret(filePath, envVarName), "fileSecret");
    assert.deepEqual(read.mock.calls[0].arguments, [filePath, "utf8"]);
  });

  it("falls back to the environment variable when reading the file fails", ({ mock }) => {
    const error = new Error("Failed to read file");
    mock.method(fs, "existsSync", () => true);
    mock.method(fs, "readFileSync", () => { throw error; });
    const log = mock.method(console, "error", () => {});
    process.env[envVarName] = "envSecret";

    assert.equal(loadSecret(filePath, envVarName), "envSecret");
    assert.deepEqual(log.mock.calls[0].arguments, [
      `Error reading secret file at ${filePath}:`, error,
    ]);
  });

  it("returns the environment variable if the file is missing", ({ mock }) => {
    mock.method(fs, "existsSync", () => false);
    process.env[envVarName] = "envSecret";

    assert.equal(loadSecret(filePath, envVarName), "envSecret");
  });

  it("warns and returns an empty string if the secret is missing", ({ mock }) => {
    mock.method(fs, "existsSync", () => false);
    const warn = mock.method(console, "warn", () => {});

    assert.equal(loadSecret(filePath, envVarName), "");
    assert.deepEqual(warn.mock.calls[0].arguments, [
      `Warning: Secret not found for ${envVarName}`,
    ]);
  });
});
