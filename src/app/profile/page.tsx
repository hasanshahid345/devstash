import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Database, FolderClosed, Mail, UserRound } from "lucide-react";
import { DashboardLucideIcon } from "@/components/dashboard/lucide-icon";
import { ProfileAccountActions } from "@/components/profile/profile-account-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { getProfileData } from "@/lib/db/profile";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-black/20">
      <CardContent className="mt-0 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-50">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  const profile = await getProfileData(currentUser.id);

  return (
    <main className="min-h-screen bg-transparent px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Account
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Profile</h1>
            <p className="text-lg text-zinc-400">Manage your DevStash account and usage.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-800 px-4 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
          >
            Back to dashboard
          </Link>
        </div>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="border-white/10 bg-black/20">
            <CardContent className="mt-0 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 overflow-hidden rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-900">
                {profile.user.image ? (
                  <Image
                    src={profile.user.image}
                    alt=""
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="m-auto">{profile.user.initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-3xl font-semibold tracking-tight text-zinc-50">
                  {profile.user.name}
                </h2>
                <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                  <p className="flex min-w-0 items-center gap-2">
                    <Mail className="size-4 shrink-0 text-zinc-500" />
                    <span className="truncate">{profile.user.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-zinc-500" />
                    Joined {formatDate(profile.user.createdAt)}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserRound className="size-4 text-zinc-500" />
                    {profile.user.hasGitHubAccount ? "GitHub connected" : "Email account"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle>Account actions</CardTitle>
              <CardDescription>Security and account ownership controls.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileAccountActions
                email={profile.user.email}
                canChangePassword={profile.user.hasPassword}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Items"
            value={profile.stats.totalItems}
            icon={<Database className="size-5" />}
          />
          <StatCard
            label="Collections"
            value={profile.stats.totalCollections}
            icon={<FolderClosed className="size-5" />}
          />
        </section>

        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle>Item type breakdown</CardTitle>
            <CardDescription>Counts across your saved DevStash item types.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {profile.stats.typeCounts.map((itemType) => (
                <div
                  key={itemType.name}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                      <DashboardLucideIcon
                        iconName={itemType.iconName}
                        className={`size-4 ${itemType.iconClassName}`}
                      />
                    </div>
                    <p className="truncate text-sm font-medium text-zinc-200">{itemType.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-50">{itemType.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
