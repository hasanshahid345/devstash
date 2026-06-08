"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerWithCredentials, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {
  success: false,
  error: null,
};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerWithCredentials, initialState);

  return (
    <div className="w-full max-w-[480px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-zinc-500">Start building</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Create account</h1>
        <p className="text-sm text-zinc-400">Set up your developer knowledge hub.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">
            Name
          </label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
              Confirm
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {state.error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-100 hover:text-white">
          Sign in
        </Link>
      </p>
    </div>
  );
}
