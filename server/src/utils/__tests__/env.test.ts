import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRequiredEnv } from "../env";

describe("getRequiredEnv", () => {
  it("should return the value when provided", () => {
    const value = "my-secret-value";
    assert.equal(getRequiredEnv(value), value);
  });

  it("should throw an error when the value is nullish", () => {
    assert.throws(() => getRequiredEnv(undefined), /Missing environment variable: undefined/);
    assert.throws(() => getRequiredEnv(null), /Missing environment variable: null/);
  });

  it("should throw an error when the value is an empty string", () => {
    assert.throws(() => getRequiredEnv(""), /Missing environment variable: $/);
  });
});
