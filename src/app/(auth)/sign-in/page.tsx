import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getSignedInUserForAuthPages } from "@/lib/current-user";

export default async function SignInPage() {
  const user = await getSignedInUserForAuthPages();

  if (user) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
