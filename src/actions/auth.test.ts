import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => {
  class AuthError extends Error {
    type = "AuthError";
  }

  class CredentialsSignin extends AuthError {
    code = "credentials";
    type = "CredentialsSignin";
  }

  return {
    AuthError,
    CredentialsSignin,
  };
});

const authMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

const flagMocks = vi.hoisted(() => ({
  isEmailVerificationEnabled: vi.fn(() => true),
}));

const emailMocks = vi.hoisted(() => ({
  createEmailVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

const passwordResetMocks = vi.hoisted(() => ({
  createPasswordResetToken: vi.fn(),
  findPasswordResetToken: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  verificationToken: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
  },
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMocks.auth,
  signIn: authMocks.signIn,
  signOut: authMocks.signOut,
}));

vi.mock("@/lib/auth-flags", () => ({
  isEmailVerificationEnabled: flagMocks.isEmailVerificationEnabled,
}));

vi.mock("@/lib/email-verification", () => ({
  createEmailVerificationToken: emailMocks.createEmailVerificationToken,
  sendVerificationEmail: emailMocks.sendVerificationEmail,
}));

vi.mock("@/lib/password-reset", () => ({
  createPasswordResetToken: passwordResetMocks.createPasswordResetToken,
  findPasswordResetToken: passwordResetMocks.findPasswordResetToken,
  sendPasswordResetEmail: passwordResetMocks.sendPasswordResetEmail,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: prismaMocks.user,
    verificationToken: prismaMocks.verificationToken,
    $transaction: prismaMocks.transaction,
  },
}));

import { signInWithCredentials } from "@/actions/auth";

afterEach(() => {
  vi.clearAllMocks();
});

describe("signInWithCredentials", () => {
  it("returns a validation error when the email is invalid", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("password", "password123");

    await expect(signInWithCredentials({ success: false, error: null }, formData)).resolves.toEqual({
      success: false,
      error: "Enter a valid email address.",
    });

    expect(authMocks.signIn).not.toHaveBeenCalled();
  });

  it("signs in with the credentials provider for valid input", async () => {
    authMocks.signIn.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set("email", "User@Example.com");
    formData.set("password", "password123");

    await expect(signInWithCredentials({ success: false, error: null }, formData)).resolves.toEqual({
      success: true,
      error: null,
    });

    expect(authMocks.signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "password123",
      redirectTo: "/dashboard",
    });
  });
});
