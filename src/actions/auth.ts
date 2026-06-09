"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { isEmailVerificationEnabled } from "@/lib/auth-flags";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email-verification";
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

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
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
