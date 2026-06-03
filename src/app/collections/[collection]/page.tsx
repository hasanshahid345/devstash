import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const collectionAccentClassNames: Record<string, string> = {
  blue: "border-sky-500/70",
  violet: "border-violet-500/70",
  orange: "border-orange-500/70",
  yellow: "border-yellow-400/70",
  slate: "border-slate-500/70",
  pink: "border-pink-500/70",
  emerald: "border-emerald-500/70",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const collectionData = mockDashboardData.collections.find(
    (entry) => slugify(entry.name) === collection || entry.id === collection,
  );

  if (!collectionData) {
    notFound();
  }

  const items = mockDashboardData.items.filter(
    (item) => item.collectionId === collectionData.id,
  );

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/collections"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Back to collections
        </Link>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/[0.04] text-xl ${
              collectionAccentClassNames[collectionData.color] ?? "border-zinc-700"
            }`}
          >
            []
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">
              {collectionData.name}
            </h1>
            <p className="text-lg text-zinc-400">{collectionData.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const itemType = mockDashboardData.itemTypes.find((type) => type.id === item.typeId);

          return (
            <Card key={item.id} className="border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className={itemTypeColorClassNames[item.typeId] ?? "text-zinc-400"}>
                    {itemType?.icon ?? "<>"}
                  </span>
                  <span>{item.title}</span>
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-0 flex items-center justify-between text-sm text-zinc-500">
                <span>{item.tags.join(" · ")}</span>
                <span>{formatDate(item.updatedAt)}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
