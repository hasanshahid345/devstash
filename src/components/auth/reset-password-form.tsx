"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {
  success: false,
  error: null,
};

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  return (
    <div className="w-full max-w-[480px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-zinc-500">Choose a new password</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Reset password</h1>
        <p className="text-sm text-zinc-400">Pick a new password for your DevStash account.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            New password
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
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        {state.error ? (
          <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400">
        Need a different account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-100 hover:text-white">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
