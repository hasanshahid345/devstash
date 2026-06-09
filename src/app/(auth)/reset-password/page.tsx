import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { findPasswordResetToken } from "@/lib/password-reset";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const tokenValue = Array.isArray(token) ? token[0] : token;

  if (!tokenValue) {
    redirect("/sign-in?error=missing_reset_token");
  }

  const resetToken = await findPasswordResetToken(tokenValue);

  if (!resetToken || resetToken.expires < new Date()) {
    redirect("/sign-in?error=invalid_reset_token");
  }

  return <ResetPasswordForm token={tokenValue} />;
}
