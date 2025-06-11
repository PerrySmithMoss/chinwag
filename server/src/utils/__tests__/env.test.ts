import { getRequiredEnv } from "../env";

describe("getRequiredEnv", () => {
  it("should return the value when provided", () => {
    const value = "my-secret-value";
    expect(getRequiredEnv(value)).toBe(value);
  });

  it("should throw an error when the value is nullish", () => {
    expect(() => getRequiredEnv(undefined)).toThrow(
      "Missing environment variable: undefined"
    );
    expect(() => getRequiredEnv(null)).toThrow(
      "Missing environment variable: null"
    );
  });

  it("should throw an error when the value is an empty string", () => {
    expect(() => getRequiredEnv("")).toThrow("Missing environment variable: ");
  });
});
