import "server-only";

const DISABLED_VALUES = new Set(["false", "0", "off", "no"]);

export function isEmailVerificationEnabled() {
  const value = process.env.AUTH_EMAIL_VERIFICATION_ENABLED;

  if (value == null) {
    return true;
  }

  return !DISABLED_VALUES.has(value.trim().toLowerCase());
}
