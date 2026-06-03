import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardData } from "@/lib/mock-data";

const itemTypeColorClassNames: Record<string, string> = {
  type_snippet: "text-sky-400",
  type_prompt: "text-violet-400",
  type_command: "text-orange-400",
  type_note: "text-yellow-300",
  type_file: "text-slate-300",
  type_image: "text-pink-400",
  type_url: "text-emerald-400",
};

const collectionAccentClassNames: Record<string, string> = {
  blue: "before:bg-sky-500",
  violet: "before:bg-violet-500",
  orange: "before:bg-orange-500",
  yellow: "before:bg-yellow-400",
  slate: "before:bg-slate-500",
  pink: "before:bg-pink-500",
  emerald: "before:bg-emerald-500",
};

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

export default function DashboardPage() {
  const collections = mockDashboardData.collections;
  const pinnedItems = mockDashboardData.items.filter((item) => item.isPinned);
  const recentItems = [...mockDashboardData.items]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4);

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="text-lg text-zinc-400">Your developer knowledge hub</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Collections</h2>
          <a
            href="/collections"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            View all
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className={`relative overflow-hidden border-white/10 bg-black/20 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:content-[''] ${
                collectionAccentClassNames[collection.color] ?? "before:bg-zinc-600"
              }`}
            >
              <CardHeader className="pr-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <span>{collection.name}</span>
                      {collection.isFavorite ? <span className="text-sm text-yellow-300">*</span> : null}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm">{collection.description}</CardDescription>
                  </div>
                  <button
                    type="button"
                    aria-label={`Collection options for ${collection.name}`}
                    className="text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    ...
                  </button>
                </div>
                <p className="text-sm text-zinc-400">{collection.itemIds.length} items</p>
              </CardHeader>

              <CardContent className="mt-5">
                <div className="flex flex-wrap gap-2 text-sm">
                  {collection.itemIds.slice(0, 4).map((itemId) => {
                    const item = mockDashboardData.items.find((entry) => entry.id === itemId);
                    if (!item) {
                      return null;
                    }

                    const itemType = mockDashboardData.itemTypes.find(
                      (type) => type.id === item.typeId,
                    );

                    return (
                      <span
                        key={item.id}
                        className="inline-flex items-center rounded-full border border-white/6 bg-white/[0.04] px-2.5 py-1 text-zinc-300"
                      >
                        <span className={itemTypeColorClassNames[item.typeId] ?? "text-zinc-400"}>
                          {itemType?.icon ?? "<>"}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="text-xl">Pin</span>
          <h2 className="text-xl font-semibold text-zinc-300">Pinned</h2>
        </div>

        <div className="space-y-4">
          {pinnedItems.map((item) => {
            const itemType = mockDashboardData.itemTypes.find((type) => type.id === item.typeId);

            return (
              <Card key={item.id} className="border-white/10 bg-black/20">
                <CardContent className="mt-0">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-950/80 text-xl">
                      <span className={itemTypeColorClassNames[item.typeId] ?? "text-sky-400"}>
                        {itemType?.icon ?? "<>"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-zinc-50">{item.title}</h3>
                        <span className="text-zinc-500">Pin</span>
                        {item.isFavorite ? <span className="text-yellow-300">*</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/[0.07] px-2.5 py-1 text-sm text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm text-zinc-500">{formatDate(item.updatedAt)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-300">Recent items</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {recentItems.map((item) => {
            const itemType = mockDashboardData.itemTypes.find((type) => type.id === item.typeId);

            return (
              <Card key={item.id} className="border-white/10 bg-black/15">
                <CardContent className="mt-0">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-lg">
                      <span className={itemTypeColorClassNames[item.typeId] ?? "text-zinc-400"}>
                        {itemType?.icon ?? "<>"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-medium text-zinc-100">{item.title}</h3>
                        {item.isPinned ? <span className="text-zinc-500">Pin</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </section>
  );
}
