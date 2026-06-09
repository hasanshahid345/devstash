import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getSignedInUserForAuthPages } from "@/lib/current-user";

export default async function ForgotPasswordPage() {
  const user = await getSignedInUserForAuthPages();

  if (user) {
    redirect("/dashboard");
  }

  return <ForgotPasswordForm />;
}
