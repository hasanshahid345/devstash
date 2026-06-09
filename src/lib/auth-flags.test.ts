import { afterEach, describe, expect, it } from "vitest";
import { isEmailVerificationEnabled } from "@/lib/auth-flags";

const originalValue = process.env.AUTH_EMAIL_VERIFICATION_ENABLED;

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env.AUTH_EMAIL_VERIFICATION_ENABLED;
    return;
  }

  process.env.AUTH_EMAIL_VERIFICATION_ENABLED = originalValue;
});

describe("isEmailVerificationEnabled", () => {
  it("defaults to enabled when the flag is missing", () => {
    delete process.env.AUTH_EMAIL_VERIFICATION_ENABLED;

    expect(isEmailVerificationEnabled()).toBe(true);
  });

  it("treats common false-like values as disabled", () => {
    process.env.AUTH_EMAIL_VERIFICATION_ENABLED = "off";

    expect(isEmailVerificationEnabled()).toBe(false);
  });
});
