import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user?.id || !email) {
    redirect("/sign-in");
  }

  const name = session.user.name ?? "DevStash User";

  return {
    id: session.user.id,
    name,
    email,
    image: session.user.image ?? null,
    initials: getInitials(name, email),
  };
}
