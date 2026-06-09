import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSignedInUserForAuthPages } from "@/lib/current-user";

export default async function RegisterPage() {
  const user = await getSignedInUserForAuthPages();

  if (user) {
    redirect("/dashboard");
  }

  return <RegisterForm />;
}
