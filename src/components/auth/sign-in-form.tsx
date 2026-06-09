"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signInWithCredentials, signInWithGitHub, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {
  success: false,
  error: null,
};

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, initialState);
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const registered = searchParams.get("registered");
  const authError = searchParams.get("error");
  const bannerMessage =
      verified === "1"
        ? "Your email has been verified. You can sign in now."
        : searchParams.get("reset") === "1"
          ? "Your password has been updated. You can sign in now."
        : registered === "1"
          ? "Check your inbox for a verification link before signing in."
          : searchParams.get("reset_sent") === "1"
            ? "If an account exists for that email, we sent a password reset link."
          : authError === "email_not_verified"
            ? "Verify your email address before signing in."
            : authError === "invalid_token"
              ? "That verification link is invalid or expired."
              : authError === "missing_token"
                ? "The verification link is missing a token."
                : authError === "invalid_reset_token"
                  ? "That password reset link is invalid or expired."
                  : authError === "missing_reset_token"
                    ? "The password reset link is missing a token."
                  : null;

  return (
    <div className="w-full max-w-[440px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-zinc-500">Welcome back</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Sign in</h1>
        <p className="text-sm text-zinc-400">Access your DevStash workspace.</p>
      </div>

      {bannerMessage ? (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {bannerMessage}
        </p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <form action={signInWithGitHub}>
        <Button type="submit" variant="outline" className="w-full">
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-sm text-zinc-400">
        Forgot your password?{" "}
        <Link href="/forgot-password" className="font-medium text-zinc-100 hover:text-white">
          Reset it
        </Link>
      </p>

      <p className="text-sm text-zinc-400">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-zinc-100 hover:text-white">
          Create one
        </Link>
      </p>
    </div>
  );
}
