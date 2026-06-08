import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/user-menu";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { getCurrentUser } from "@/lib/current-user";
import { getDashboardSidebarData } from "@/lib/db/items";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const sidebarData = await getDashboardSidebarData(currentUser.email);

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <div className="relative min-h-screen lg:flex">
        <DashboardSidebar data={sidebarData} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0 flex-1">
                <div className="relative max-w-[760px]">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    Search
                  </span>
                  <Input
                    aria-label="Search items"
                    placeholder="Search items..."
                    className="h-11 bg-zinc-900/80 pl-16 pr-16 text-zinc-100 placeholder:text-zinc-500"
                  />
                  <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-white/8 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-500">
                    Cmd K
                  </kbd>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <Button variant="outline">New Collection</Button>
                <Button>New Item</Button>
              </div>
              <UserMenu user={currentUser} />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
