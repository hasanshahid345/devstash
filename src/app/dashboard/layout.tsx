"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mockDashboardData } from "@/lib/mock-data";

const itemTypeColorClassNames: Record<string, string> = {
  blue: "text-sky-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
  yellow: "text-yellow-300",
  slate: "text-slate-400",
  pink: "text-pink-400",
  emerald: "text-emerald-400",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTypeHref(name: string) {
  return `/items/${slugify(name)}`;
}

function getCollectionHref(name: string) {
  return `/collections/${slugify(name)}`;
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DrawerToggleIcon({
  isOpen,
}: {
  isOpen: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d={isOpen ? "M10 8l4 4-4 4" : "M14 8l-4 4 4 4"} />
      <path d="M7.5 4v16" />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const favoriteCollections = mockDashboardData.collections.filter(
    (collection) => collection.isFavorite,
  );
  const recentCollections = [...mockDashboardData.collections].slice(-3).reverse();

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSidebarToggle = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileSidebarOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
  };

  const closeMobileSidebarIfNeeded = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <div className="relative min-h-screen lg:flex">
        {isMobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        ) : null}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[320px] max-w-[85vw] flex-col border-r border-white/8 bg-black/90 backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:shrink-0 lg:translate-x-0",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            isSidebarCollapsed ? "lg:w-[88px]" : "lg:w-[320px]",
          )}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-end border-b border-white/8 px-3 py-3 lg:px-4">
              <Button
                type="button"
                variant="ghost"
                aria-label={
                  isMobileSidebarOpen || !isSidebarCollapsed
                    ? "Close sidebar"
                    : "Open sidebar"
                }
                aria-expanded={isMobileSidebarOpen || !isSidebarCollapsed}
                onClick={handleSidebarToggle}
                className="inline-flex"
              >
                <DrawerToggleIcon isOpen={isMobileSidebarOpen || !isSidebarCollapsed} />
              </Button>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 border-b border-white/8 px-5 py-4",
                isSidebarCollapsed ? "lg:justify-center lg:px-4" : "",
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.35)]">
                DS
              </div>
              <div className={cn("min-w-0", isSidebarCollapsed ? "lg:hidden" : "")}>
                <p className="text-lg font-semibold leading-none">DevStash</p>
                <p className="mt-1 text-xs text-zinc-500">Developer knowledge hub</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
              <div className="space-y-5">
                <section>
                  <div
                    className={cn(
                      "mb-3 flex items-center justify-between px-2 text-sm font-medium text-zinc-400",
                      isSidebarCollapsed ? "lg:justify-center lg:px-0" : "",
                    )}
                  >
                    <span className={isSidebarCollapsed ? "lg:hidden" : ""}>Types</span>
                    <span aria-hidden className={isSidebarCollapsed ? "lg:hidden" : "text-xs"}>
                      v
                    </span>
                  </div>

                  <nav className="space-y-1">
                    {mockDashboardData.itemTypes.map((itemType) => {
                      const href = getTypeHref(itemType.name);
                      const active = isRouteActive(pathname, href);

                      return (
                        <Link
                          key={itemType.id}
                          href={href}
                          onNavigate={closeMobileSidebarIfNeeded}
                          className={cn(
                            "group flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] transition-colors",
                            active
                              ? "bg-white/6 text-white"
                              : "text-zinc-200 hover:bg-white/5 hover:text-white",
                            isSidebarCollapsed ? "lg:justify-center lg:px-0" : "",
                          )}
                          title={itemType.name}
                        >
                          <span className="flex items-center gap-3">
                            <span className={itemTypeColorClassNames[itemType.color] ?? "text-zinc-400"}>
                              {itemType.icon}
                            </span>
                            <span className={cn(isSidebarCollapsed ? "lg:hidden" : "")}>
                              {itemType.name}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "text-sm text-zinc-500",
                              isSidebarCollapsed ? "lg:hidden" : "",
                            )}
                          >
                            {itemType.itemIds.length}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                </section>

                <section>
                  <div
                    className={cn(
                      "mb-3 flex items-center justify-between px-2 text-sm font-medium text-zinc-400",
                      isSidebarCollapsed ? "lg:justify-center lg:px-0" : "",
                    )}
                  >
                    <span className={isSidebarCollapsed ? "lg:hidden" : ""}>Collections</span>
                    <span aria-hidden className={isSidebarCollapsed ? "lg:hidden" : "text-xs"}>
                      v
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p
                        className={cn(
                          "px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-600",
                          isSidebarCollapsed ? "lg:hidden" : "",
                        )}
                      >
                        Recent
                      </p>
                      <div className="space-y-1">
                        {recentCollections.map((collection) => {
                          const href = getCollectionHref(collection.name);
                          const active = isRouteActive(pathname, href);

                          return (
                            <Link
                              key={collection.id}
                              href={href}
                              onNavigate={closeMobileSidebarIfNeeded}
                              className={cn(
                                "group flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] transition-colors",
                                active
                                  ? "bg-white/6 text-white"
                                  : "text-zinc-200 hover:bg-white/5 hover:text-white",
                                isSidebarCollapsed ? "lg:justify-center lg:px-0" : "",
                              )}
                              title={collection.name}
                            >
                              <span className="flex items-center gap-3">
                                <span className="text-zinc-500">[]</span>
                                <span className={cn(isSidebarCollapsed ? "lg:hidden" : "")}>
                                  {collection.name}
                                </span>
                              </span>
                              <span className={cn("text-zinc-500", isSidebarCollapsed ? "lg:hidden" : "")}>
                                *
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p
                        className={cn(
                          "px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-600",
                          isSidebarCollapsed ? "lg:hidden" : "",
                        )}
                      >
                        Favorites
                      </p>
                      <div className="space-y-1">
                        {favoriteCollections.map((collection) => {
                          const href = getCollectionHref(collection.name);
                          const active = isRouteActive(pathname, href);

                          return (
                            <Link
                              key={collection.id}
                              href={href}
                              onNavigate={closeMobileSidebarIfNeeded}
                              className={cn(
                                "group flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] transition-colors",
                                active
                                  ? "bg-white/6 text-white"
                                  : "text-zinc-200 hover:bg-white/5 hover:text-white",
                                isSidebarCollapsed ? "lg:justify-center lg:px-0" : "",
                              )}
                              title={collection.name}
                            >
                              <span className="flex items-center gap-3">
                                <span className="text-zinc-500">[]</span>
                                <span className={cn(isSidebarCollapsed ? "lg:hidden" : "")}>
                                  {collection.name}
                                </span>
                              </span>
                              <span className={cn("text-zinc-500", isSidebarCollapsed ? "lg:hidden" : "")}>
                                *
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p
                        className={cn(
                          "px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-600",
                          isSidebarCollapsed ? "lg:hidden" : "",
                        )}
                      >
                        All collections
                      </p>
                      <div className="space-y-1">
                        {mockDashboardData.collections.map((collection) => {
                          const href = getCollectionHref(collection.name);
                          const active = isRouteActive(pathname, href);

                          return (
                            <Link
                              key={collection.id}
                              href={href}
                              onNavigate={closeMobileSidebarIfNeeded}
                              className={cn(
                                "group flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] transition-colors",
                                active
                                  ? "bg-white/6 text-white"
                                  : "text-zinc-200 hover:bg-white/5 hover:text-white",
                                isSidebarCollapsed ? "lg:justify-center lg:px-0" : "",
                              )}
                              title={collection.name}
                            >
                              <span className="flex items-center gap-3">
                                <span className="text-zinc-500">[]</span>
                                <span className={cn(isSidebarCollapsed ? "lg:hidden" : "")}>
                                  {collection.name}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "text-sm text-zinc-500",
                                  isSidebarCollapsed ? "lg:hidden" : "",
                                )}
                              >
                                {collection.itemIds.length}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-white/8 p-3">
              <div
                className={cn(
                  "flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3",
                  isSidebarCollapsed ? "lg:justify-center lg:px-2" : "",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-900">
                    JD
                  </div>
                  <div className={cn("min-w-0", isSidebarCollapsed ? "lg:hidden" : "")}>
                    <p className="truncate text-sm font-medium">{mockDashboardData.user.name}</p>
                    <p className="truncate text-xs text-zinc-500">{mockDashboardData.user.email}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300",
                    isSidebarCollapsed ? "lg:hidden" : "",
                  )}
                >
                  Pro
                </span>
              </div>
            </div>
          </div>
        </aside>

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
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
