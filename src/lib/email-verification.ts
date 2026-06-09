import "server-only";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const RESEND_API_URL = "https://api.resend.com/emails";
const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

export async function createEmailVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return { token, expires };
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

export async function sendVerificationEmail(params: {
  email: string;
  name: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  const baseUrl = await resolveBaseUrl();
  const verificationUrl = new URL("/verify-email", baseUrl);
  verificationUrl.searchParams.set("token", params.token);

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "DevStash <onboarding@resend.dev>",
      to: [params.email],
      subject: "Verify your DevStash email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h1 style="font-size: 20px; margin-bottom: 12px;">Verify your DevStash email</h1>
          <p style="margin: 0 0 16px;">Hi ${params.name},</p>
          <p style="margin: 0 0 20px;">
            Click the link below to verify your email address and finish setting up your account.
          </p>
          <p style="margin: 0 0 24px;">
            <a href="${verificationUrl.toString()}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px;">
              Verify email
            </a>
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      `,
      text: `Verify your DevStash email: ${verificationUrl.toString()}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${errorText}`);
  }
}
