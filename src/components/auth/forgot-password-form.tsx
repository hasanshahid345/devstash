"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {
  success: false,
  error: null,
};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="w-full max-w-[440px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-zinc-500">Recover access</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Forgot password</h1>
        <p className="text-sm text-zinc-400">We’ll send a reset link to your email address.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        {state.error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-100 hover:text-white">
          Sign in
        </Link>
      </p>
    </div>
  );
}
