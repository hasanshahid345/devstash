"use client";

import Link from "next/link";
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

  return (
    <div className="w-full max-w-[440px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-zinc-500">Welcome back</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Sign in</h1>
        <p className="text-sm text-zinc-400">Access your DevStash workspace.</p>
      </div>

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
        Need an account?{" "}
        <Link href="/register" className="font-medium text-zinc-100 hover:text-white">
          Create one
        </Link>
      </p>
    </div>
  );
}
