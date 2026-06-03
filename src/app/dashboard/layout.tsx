import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockDashboardData } from "@/lib/mock-data";

const typeColorClassNames: Record<string, string> = {
  blue: "text-sky-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
  yellow: "text-yellow-300",
  slate: "text-slate-400",
  pink: "text-pink-400",
  emerald: "text-emerald-400",
};

function toItemHref(name: string) {
  return `/items/${name.toLowerCase()}`;
}

function toCollectionHref(name: string) {
  return `/collections/${name.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const favoriteCollections = mockDashboardData.collections.filter(
    (collection) => collection.isFavorite,
  );
  const allCollections = mockDashboardData.collections;

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <div className="grid min-h-screen lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/8 bg-black/85 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.35)]">
              DS
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">DevStash</p>
              <p className="mt-1 text-xs text-zinc-500">Developer knowledge hub</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between px-2 text-sm font-medium text-zinc-400">
                  <span>Types</span>
                  <span aria-hidden className="text-xs text-zinc-500">
                    v
                  </span>
                </div>

                <nav className="space-y-1">
                  {mockDashboardData.itemTypes.map((itemType) => (
                    <a
                      key={itemType.id}
                      href={toItemHref(itemType.name)}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] text-zinc-200 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        <span className={typeColorClassNames[itemType.color] ?? "text-zinc-400"}>
                          {itemType.icon}
                        </span>
                        <span>{itemType.name}</span>
                      </span>
                      <span className="text-sm text-zinc-500">{itemType.itemIds.length}</span>
                    </a>
                  ))}
                </nav>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between px-2 text-sm font-medium text-zinc-400">
                  <span>Collections</span>
                  <span aria-hidden className="text-xs text-zinc-500">
                    v
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
                      Favorites
                    </p>
                    <div className="space-y-1">
                      {favoriteCollections.map((collection) => (
                        <a
                          key={collection.id}
                          href={toCollectionHref(collection.name)}
                          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] text-zinc-200 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-zinc-500">[]</span>
                            <span>{collection.name}</span>
                          </span>
                          <span className="text-zinc-500">*</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
                      All collections
                    </p>
                    <div className="space-y-1">
                      {allCollections.map((collection) => (
                        <a
                          key={collection.id}
                          href={toCollectionHref(collection.name)}
                          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[15px] text-zinc-200 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-zinc-500">[]</span>
                            <span>{collection.name}</span>
                          </span>
                          <span className="text-sm text-zinc-500">{collection.itemIds.length}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-white/8 px-4 py-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-900">
                  JD
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{mockDashboardData.user.name}</p>
                  <p className="truncate text-xs text-zinc-500">{mockDashboardData.user.email}</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                Pro
              </span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                aria-label="Open sidebar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-300 transition-colors hover:border-white/15 hover:bg-white/[0.06] lg:hidden"
              >
                Menu
              </button>
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-sm font-semibold text-zinc-200 lg:flex">
                Menu
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  aria-label="Search items"
                  placeholder="Search items..."
                  className="max-w-[760px] bg-zinc-900/80 pl-4 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">New Collection</Button>
                <Button>New Item</Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
