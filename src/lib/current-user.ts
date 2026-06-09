import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isEmailVerificationEnabled } from "@/lib/auth-flags";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  initials: string;
}

function getInitials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const emailVerificationEnabled = isEmailVerificationEnabled();
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user?.id || !email) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  if (emailVerificationEnabled && user.password && !user.emailVerified) {
    redirect("/sign-in?error=email_not_verified");
  }

  const name = user.name ?? session.user.name ?? "DevStash User";

  return {
    id: session.user.id,
    name,
    email: user.email ?? email,
    image: user.image ?? session.user.image ?? null,
    initials: getInitials(name, email),
  };
}

export async function getSignedInUserForAuthPages(): Promise<CurrentUser | null> {
  const emailVerificationEnabled = isEmailVerificationEnabled();
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user?.id || !email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return null;
  }

  if (emailVerificationEnabled && user.password && !user.emailVerified) {
    return null;
  }

  const name = user.name ?? session.user.name ?? "DevStash User";

  return {
    id: session.user.id,
    name,
    email: user.email ?? email,
    image: user.image ?? session.user.image ?? null,
    initials: getInitials(name, email),
  };
}
