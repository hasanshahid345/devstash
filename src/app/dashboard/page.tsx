import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLucideIcon } from "@/components/dashboard/lucide-icon";
import { getDashboardCollectionsData } from "@/lib/db/collections";
import { getDashboardItemsData, type DashboardItemCard as DashboardItemCardData } from "@/lib/db/items";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function StatCard({
  label,
  value,
  note,
  accentClassName,
}: {
  label: string;
  value: number;
  note: string;
  accentClassName: string;
}) {
  return (
    <Card className="border-white/10 bg-black/20">
      <CardContent className="mt-0 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-50">{value}</p>
          <p className="mt-2 text-sm text-zinc-400">{note}</p>
        </div>
        <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${accentClassName}`} />
      </CardContent>
    </Card>
  );
}

function DashboardItemCard({
  item,
  titleClassName,
  showDate,
  cardClassName,
}: {
  item: DashboardItemCardData;
  titleClassName: string;
  showDate: boolean;
  cardClassName: string;
}) {
  return (
    <Card
      className={`relative overflow-hidden border-white/10 bg-black/20 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:content-[''] ${cardClassName} ${item.borderClassName}`}
    >
      <CardContent className="mt-0">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-lg">
            <DashboardLucideIcon
              iconName={item.typeIconName}
              className={`size-5 ${item.typeIconClassName}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={titleClassName}>{item.title}</h3>
              {item.isPinned ? <span className="text-zinc-500">Pin</span> : null}
              {item.isFavorite ? <span className="text-yellow-300">*</span> : null}
            </div>
            <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/6 bg-white/[0.04] px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
                {item.typeName}
              </span>
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
          {showDate ? <div className="shrink-0 text-sm text-zinc-500">{formatDate(item.updatedAt)}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const [dashboardCollectionsData, dashboardItemsData] = await Promise.all([
    getDashboardCollectionsData(),
    getDashboardItemsData(),
  ]);
  const collections = dashboardCollectionsData.collections;
  const pinnedItems = dashboardItemsData.pinnedItems;
  const recentItems = dashboardItemsData.recentItems;

  const statCards = [
    {
      label: "Items",
      value: dashboardCollectionsData.stats.itemCount,
      note: "Everything stored in the hub",
      accentClassName: "from-sky-500/40 to-sky-500/10",
    },
    {
      label: "Collections",
      value: dashboardCollectionsData.stats.collectionCount,
      note: "All grouped workspaces",
      accentClassName: "from-violet-500/40 to-violet-500/10",
    },
    {
      label: "Favorite items",
      value: dashboardCollectionsData.stats.favoriteItemCount,
      note: "Pinned to your attention",
      accentClassName: "from-orange-500/40 to-orange-500/10",
    },
    {
      label: "Favorite collections",
      value: dashboardCollectionsData.stats.favoriteCollectionCount,
      note: "Your most-used groups",
      accentClassName: "from-emerald-500/40 to-emerald-500/10",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="text-lg text-zinc-400">Your developer knowledge hub</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Recent collections
            </h2>
            <p className="mt-1 text-sm text-zinc-400">The latest places you’ve been organizing.</p>
          </div>
          <Link
            href="/collections"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const collectionHref = `/collections/${slugify(collection.name)}`;

            return (
              <Card
                key={collection.id}
                className={`relative overflow-hidden border-white/10 bg-black/20 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:content-[''] ${collection.borderClassName}`}
              >
                <CardHeader className="pr-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={collectionHref} className="inline-flex">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <span>{collection.name}</span>
                          {collection.isFavorite ? (
                            <span className="text-sm text-yellow-300">*</span>
                          ) : null}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-2 text-sm">
                        {collection.description}
                      </CardDescription>
                    </div>
                    <button
                      type="button"
                      aria-label={`Collection options for ${collection.name}`}
                      className="text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      ...
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400">{collection.itemCount} items</p>
                </CardHeader>

                <CardContent className="mt-5">
                  <div className="flex flex-wrap gap-2 text-sm">
                    {collection.types.map((type) => {
                      return (
                        <span
                          key={type.name}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/6 bg-white/[0.04] px-2.5 py-1 text-zinc-300"
                          title={`${type.name} (${type.count})`}
                        >
                          <DashboardLucideIcon
                            iconName={type.icon}
                            className={`size-3.5 ${type.iconClassName}`}
                          />
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {pinnedItems.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="text-xl">Pin</span>
            <h2 className="text-xl font-semibold text-zinc-300">Pinned items</h2>
          </div>

          <div className="space-y-4">
            {pinnedItems.map((item) => (
              <DashboardItemCard
                key={item.id}
                item={item}
                titleClassName="text-lg font-semibold text-zinc-50"
                showDate
                cardClassName="bg-black/20"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-300">Recent items</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {recentItems.map((item) => (
            <DashboardItemCard
              key={item.id}
              item={item}
              titleClassName="text-base font-medium text-zinc-100"
              showDate={false}
              cardClassName="bg-black/15"
            />
          ))}
        </div>
      </section>
    </section>
  );
}
