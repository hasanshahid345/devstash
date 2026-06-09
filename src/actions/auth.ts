"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { auth, signIn, signOut } from "@/lib/auth";
import { isEmailVerificationEnabled } from "@/lib/auth-flags";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email-verification";
import {
  createPasswordResetToken,
  findPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/password-reset";
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  getRateLimitMessage,
} from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export interface AuthFormState {
  success: boolean;
  error: string | null;
}

const signInSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

const registerSchema = signInSchema
  .extend({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const passwordResetRequestSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
});

const resendVerificationSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
});

const deleteAccountSchema = z.object({
  confirmEmail: z.email({ error: "Enter your account email address." }).trim().toLowerCase(),
});

const passwordResetSchema = z
  .object({
    token: z.string().min(1, "The reset link is missing a token."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
    if (error instanceof CredentialsSignin && error.code === "rate_limited") {
      return "Too many sign-in attempts. Please try again in a few minutes.";
    }

    if (error instanceof CredentialsSignin && error.code === "email_not_verified") {
      return "Verify your email address before signing in.";
    }

    if (error.type === "CredentialsSignin") {
      return "Invalid email or password.";
    }

    return "Authentication failed. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export async function signInWithCredentials(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedFields = signInSchema.safeParse({
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
  });

  if (!parsedFields.success) {
    return {
      success: false,
      error: parsedFields.error.issues[0]?.message ?? "Check your sign-in details.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsedFields.data.email,
      password: parsedFields.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    unstable_rethrow(error);

    return {
      success: false,
      error: getAuthErrorMessage(error),
    };
  }

  return {
    success: true,
    error: null,
  };
}

export async function signInWithGitHub() {
  await signIn("github", {
    redirectTo: "/dashboard",
  });
}

export async function registerWithCredentials(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const emailVerificationEnabled = isEmailVerificationEnabled();
  const parsedFields = registerSchema.safeParse({
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
  });

  if (!parsedFields.success) {
    return {
      success: false,
      error: parsedFields.error.issues[0]?.message ?? "Check your registration details.",
    };
  }

  const registrationRateLimit = await checkRateLimit({
    route: AUTH_RATE_LIMITS.register.route,
    limit: AUTH_RATE_LIMITS.register.limit,
    window: AUTH_RATE_LIMITS.register.window,
    headers: await headers(),
  });

  if (!registrationRateLimit.success) {
    return {
      success: false,
      error: getRateLimitMessage(registrationRateLimit),
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsedFields.data.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account already exists for that email.",
    };
  }

  const hashedPassword = await bcrypt.hash(parsedFields.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsedFields.data.name,
      email: parsedFields.data.email,
      password: hashedPassword,
      emailVerified: emailVerificationEnabled ? null : new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!emailVerificationEnabled) {
    await signIn("credentials", {
      email: parsedFields.data.email,
      password: parsedFields.data.password,
      redirectTo: "/dashboard",
    });

    return {
      success: true,
      error: null,
    };
  }

  const verificationToken = await createEmailVerificationToken(user.email);

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name ?? "there",
      token: verificationToken.token,
    });
  } catch (error) {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: {
          token: verificationToken.token,
        },
      }),
      prisma.user.delete({
        where: {
          id: user.id,
        },
      }),
    ]);

    unstable_rethrow(error);

    return {
      success: false,
      error: "We could not send the verification email. Please try again.",
    };
  }

  redirect("/sign-in?registered=1");
}

export async function signOutCurrentUser() {
  await signOut({
    redirectTo: "/sign-in",
  });
}

export async function requestCurrentUserPasswordReset(): Promise<AuthFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user?.email) {
    redirect("/sign-in");
  }

  if (!user.password) {
    return {
      success: false,
      error: "Password changes are only available for email accounts.",
    };
  }

  const passwordResetRateLimit = await checkRateLimit({
    route: AUTH_RATE_LIMITS.forgotPassword.route,
    limit: AUTH_RATE_LIMITS.forgotPassword.limit,
    window: AUTH_RATE_LIMITS.forgotPassword.window,
    headers: await headers(),
  });

  if (!passwordResetRateLimit.success) {
    return {
      success: false,
      error: getRateLimitMessage(passwordResetRateLimit),
    };
  }

  const resetToken = await createPasswordResetToken(user.email);

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name ?? "there",
      token: resetToken.token,
    });
  } catch (error) {
    await prisma.verificationToken.deleteMany({
      where: {
        token: resetToken.token,
      },
    });

    unstable_rethrow(error);

    return {
      success: false,
      error: "We could not send the password reset email. Please try again.",
    };
  }

  return {
    success: true,
    error: null,
  };
}

export async function requestEmailVerificationResend(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedFields = resendVerificationSchema.safeParse({
    email: getFormString(formData, "email"),
  });

  if (!parsedFields.success) {
    return {
      success: false,
      error: parsedFields.error.issues[0]?.message ?? "Enter your email address.",
    };
  }

  const verificationRateLimit = await checkRateLimit({
    route: AUTH_RATE_LIMITS.resendVerification.route,
    limit: AUTH_RATE_LIMITS.resendVerification.limit,
    window: AUTH_RATE_LIMITS.resendVerification.window,
    headers: await headers(),
    identifier: parsedFields.data.email,
  });

  if (!verificationRateLimit.success) {
    return {
      success: false,
      error: getRateLimitMessage(verificationRateLimit),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsedFields.data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user || user.emailVerified) {
    redirect("/sign-in?verification_sent=1");
  }

  const verificationToken = await createEmailVerificationToken(user.email);

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name ?? "there",
      token: verificationToken.token,
    });
  } catch (error) {
    await prisma.verificationToken.deleteMany({
      where: {
        token: verificationToken.token,
      },
    });

    unstable_rethrow(error);

    return {
      success: false,
      error: "We could not send the verification email. Please try again.",
    };
  }

  redirect("/sign-in?verification_sent=1");
}

export async function deleteCurrentUserAccount(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const parsedFields = deleteAccountSchema.safeParse({
    confirmEmail: getFormString(formData, "confirmEmail"),
  });

  if (!parsedFields.success) {
    return {
      success: false,
      error: parsedFields.error.issues[0]?.message ?? "Confirm your email address.",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      email: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  if (parsedFields.data.confirmEmail !== user.email.toLowerCase()) {
    return {
      success: false,
      error: "The email address does not match your account.",
    };
  }

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: {
        OR: [
          {
            identifier: user.email,
          },
          {
            identifier: `password-reset:${user.email}`,
          },
        ],
      },
    }),
    prisma.user.delete({
      where: {
        id: session.user.id,
      },
    }),
  ]);

  await signOut({
    redirectTo: "/sign-in?account_deleted=1",
  });

  return {
    success: true,
    error: null,
  };
}

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedFields = passwordResetRequestSchema.safeParse({
    email: getFormString(formData, "email"),
  });

  if (!parsedFields.success) {
    return {
      success: false,
      error: parsedFields.error.issues[0]?.message ?? "Enter your email address.",
    };
  }

  const passwordResetRateLimit = await checkRateLimit({
    route: AUTH_RATE_LIMITS.forgotPassword.route,
    limit: AUTH_RATE_LIMITS.forgotPassword.limit,
    window: AUTH_RATE_LIMITS.forgotPassword.window,
    headers: await headers(),
  });

  if (!passwordResetRateLimit.success) {
    return {
      success: false,
      error: getRateLimitMessage(passwordResetRateLimit),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsedFields.data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/sign-in?reset_sent=1");
  }

  const resetToken = await createPasswordResetToken(user.email);

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name ?? "there",
      token: resetToken.token,
    });
  } catch (error) {
    await prisma.verificationToken.deleteMany({
      where: {
        token: resetToken.token,
      },
    });

    unstable_rethrow(error);

    return {
      success: false,
      error: "We could not send the password reset email. Please try again.",
    };
  }

  redirect("/sign-in?reset_sent=1");
}

export async function resetPassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedFields = passwordResetSchema.safeParse({
    token: getFormString(formData, "token"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
  });

  if (!parsedFields.success) {
    return {
      success: false,
      error: parsedFields.error.issues[0]?.message ?? "Check your new password.",
    };
  }

  const resetRateLimit = await checkRateLimit({
    route: AUTH_RATE_LIMITS.resetPassword.route,
    limit: AUTH_RATE_LIMITS.resetPassword.limit,
    window: AUTH_RATE_LIMITS.resetPassword.window,
    headers: await headers(),
  });

  if (!resetRateLimit.success) {
    return {
      success: false,
      error: getRateLimitMessage(resetRateLimit),
    };
  }

  const resetToken = await findPasswordResetToken(parsedFields.data.token);

  if (!resetToken || resetToken.expires < new Date()) {
    return {
      success: false,
      error: "That password reset link is invalid or expired.",
    };
  }

  const email = resetToken.identifier.slice("password-reset:".length);
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: {
        token: parsedFields.data.token,
      },
    });

    return {
      success: false,
      error: "That password reset link is invalid or expired.",
    };
  }

  const hashedPassword = await bcrypt.hash(parsedFields.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.verificationToken.deleteMany({
      where: {
        token: parsedFields.data.token,
      },
    }),
  ]);

  redirect("/sign-in?reset=1");
}
