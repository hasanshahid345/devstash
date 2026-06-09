import "server-only";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const RESEND_API_URL = "https://api.resend.com/emails";
const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_IDENTIFIER_PREFIX = "password-reset:";

export async function createPasswordResetToken(email: string) {
  const identifier = `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email}`;
  const token = randomUUID();
  const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return { token, expires };
}

export async function findPasswordResetToken(token: string) {
  return prisma.verificationToken.findFirst({
    where: {
      token,
      identifier: {
        startsWith: PASSWORD_RESET_IDENTIFIER_PREFIX,
      },
    },
    select: {
      identifier: true,
      expires: true,
    },
  });
}

function getAppBaseUrl() {
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;

  if (publicUrl) {
    return publicUrl;
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (!vercelUrl) {
    return undefined;
  }

  return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

async function resolveBaseUrl() {
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  const envBaseUrl = getAppBaseUrl();
  return envBaseUrl ?? "http://localhost:3000";
}

async function sendAuthEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "DevStash <onboarding@resend.dev>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${errorText}`);
  }
}

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const baseUrl = await resolveBaseUrl();
  const resetUrl = new URL("/reset-password", baseUrl);
  resetUrl.searchParams.set("token", params.token);

  await sendAuthEmail({
    to: params.email,
    subject: "Reset your DevStash password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h1 style="font-size: 20px; margin-bottom: 12px;">Reset your DevStash password</h1>
        <p style="margin: 0 0 16px;">Hi ${params.name},</p>
        <p style="margin: 0 0 20px;">
          Click the link below to choose a new password for your account.
        </p>
        <p style="margin: 0 0 24px;">
          <a href="${resetUrl.toString()}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px;">
            Reset password
          </a>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          If you did not request this reset, you can ignore this email.
        </p>
      </div>
    `,
    text: `Reset your DevStash password: ${resetUrl.toString()}`,
  });
}
