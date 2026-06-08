"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
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

  await prisma.user.create({
    data: {
      name: parsedFields.data.name,
      email: parsedFields.data.email,
      password: hashedPassword,
    },
  });

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

  redirect("/dashboard");
}

export async function signOutCurrentUser() {
  await signOut({
    redirectTo: "/sign-in",
  });
}
