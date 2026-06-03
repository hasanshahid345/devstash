import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardData } from "@/lib/mock-data";

const collectionAccentClassNames: Record<string, string> = {
  blue: "before:bg-sky-500",
  violet: "before:bg-violet-500",
  orange: "before:bg-orange-500",
  yellow: "before:bg-yellow-400",
  slate: "before:bg-slate-500",
  pink: "before:bg-pink-500",
  emerald: "before:bg-emerald-500",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CollectionsPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Collections</h1>
        <p className="text-lg text-zinc-400">Browse and organize grouped knowledge.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mockDashboardData.collections.map((collection) => {
          const href = `/collections/${slugify(collection.name)}`;

          return (
            <Link key={collection.id} href={href} className="block">
              <Card
                className={`relative h-full overflow-hidden border-white/10 bg-black/20 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:content-[''] ${
                  collectionAccentClassNames[collection.color] ?? "before:bg-zinc-600"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span>{collection.name}</span>
                    {collection.isFavorite ? <span className="text-sm text-yellow-300">*</span> : null}
                  </CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-0 text-sm text-zinc-400">
                  {collection.itemIds.length} items
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
