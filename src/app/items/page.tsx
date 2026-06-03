import Link from "next/link";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ItemsPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Items</h1>
        <p className="text-lg text-zinc-400">Browse all item types in the knowledge hub.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mockDashboardData.itemTypes.map((itemType) => {
          const href = `/items/${slugify(itemType.name)}`;

          return (
            <Link key={itemType.id} href={href} className="block">
              <Card className="h-full border-white/10 bg-black/20 transition-colors hover:border-white/15 hover:bg-black/30">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-lg">
                      <span className={itemTypeColorClassNames[itemType.color] ?? "text-zinc-400"}>
                        {itemType.icon}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{itemType.name}</CardTitle>
                      <CardDescription className="mt-1">{itemType.itemIds.length} items</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-0">
                  <p className="text-sm text-zinc-400">Open this type to inspect the matching items.</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
