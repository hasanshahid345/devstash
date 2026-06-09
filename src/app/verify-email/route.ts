import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_token", url.origin));
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
    },
    select: {
      identifier: true,
      expires: true,
    },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_token", url.origin));
  }

  const user = await prisma.user.findUnique({
    where: {
      email: verificationToken.identifier,
    },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: {
        token,
      },
    });

    return NextResponse.redirect(new URL("/sign-in?error=invalid_token", url.origin));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    }),
    prisma.verificationToken.deleteMany({
      where: {
        token,
      },
    }),
  ]);

  return NextResponse.redirect(new URL("/sign-in?verified=1", url.origin));
}
