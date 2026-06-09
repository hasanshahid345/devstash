"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { KeyRound, Trash2, X } from "lucide-react";
import {
  deleteCurrentUserAccount,
  requestCurrentUserPasswordReset,
  type AuthFormState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {
  success: false,
  error: null,
};

interface ProfileAccountActionsProps {
  email: string;
  canChangePassword: boolean;
}

export function ProfileAccountActions({
  email,
  canChangePassword,
}: ProfileAccountActionsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [passwordState, setPasswordState] = useState<AuthFormState>(initialState);
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteCurrentUserAccount,
    initialState,
  );

  function openDeleteDialog() {
    dialogRef.current?.showModal();
  }

  function closeDeleteDialog() {
    dialogRef.current?.close();
  }

  function requestPasswordReset() {
    startPasswordTransition(async () => {
      const result = await requestCurrentUserPasswordReset();
      setPasswordState(result);
    });
  }

  return (
    <>
      <div className="space-y-3">
        {canChangePassword ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Password</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Send a secure reset link to your account email.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isPasswordPending}
                onClick={requestPasswordReset}
                className="shrink-0"
              >
                <KeyRound className="size-4" />
                {isPasswordPending ? "Sending..." : "Change password"}
              </Button>
            </div>
            {passwordState.success ? (
              <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                Password reset link sent to {email}.
              </p>
            ) : null}
            {passwordState.error ? (
              <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {passwordState.error}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-red-100">Delete account</h3>
              <p className="mt-1 text-sm text-red-100/70">
                Permanently remove your account and saved DevStash data.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={openDeleteDialog}
              className="shrink-0 border-red-500/30 text-red-100 hover:border-red-400/50 hover:bg-red-500/10"
            >
              <Trash2 className="size-4" />
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(92vw,460px)] rounded-2xl border border-white/10 bg-zinc-950 p-0 text-zinc-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <form method="dialog" className="flex justify-end border-b border-white/8 p-3">
          <button
            type="submit"
            aria-label="Close delete account dialog"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
          >
            <X className="size-4" />
          </button>
        </form>

        <form action={deleteAction} className="space-y-5 p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-50">Delete account</h2>
            <p className="text-sm text-zinc-400">
              Type your email address to confirm this permanent action.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmEmail" className="text-sm font-medium text-zinc-300">
              Email address
            </label>
            <Input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              autoComplete="email"
              placeholder={email}
              required
            />
          </div>

          {deleteState.error ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {deleteState.error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDeleteDialog}
              disabled={isDeletePending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isDeletePending}
              className="bg-red-100 text-red-950 hover:bg-red-200"
            >
              <Trash2 className="size-4" />
              {isDeletePending ? "Deleting..." : "Delete forever"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
