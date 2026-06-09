import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { isEmailVerificationEnabled } from "@/lib/auth-flags";
import { AUTH_RATE_LIMITS, RateLimitedCredentialsSignin, checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  logger: {
    error(code, ...message) {
      console.error(`[auth][${code}]`, ...message);
    },
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const loginRateLimit = await checkRateLimit({
          route: AUTH_RATE_LIMITS.login.route,
          limit: AUTH_RATE_LIMITS.login.limit,
          window: AUTH_RATE_LIMITS.login.window,
          headers: request.headers,
          identifier: typeof credentials?.email === "string" ? credentials.email : undefined,
        });

        if (!loginRateLimit.success) {
          throw new RateLimitedCredentialsSignin();
        }

        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsedCredentials.data.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            password: true,
          },
        });

        if (!user?.password) {
          return null;
        }

        if (isEmailVerificationEnabled() && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const passwordMatches = await bcrypt.compare(
          parsedCredentials.data.password,
          user.password,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
