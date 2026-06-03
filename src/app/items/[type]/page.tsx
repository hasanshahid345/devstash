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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const itemType = mockDashboardData.itemTypes.find(
    (entry) => slugify(entry.name) === type || entry.id === type,
  );

  if (!itemType) {
    notFound();
  }

  const items = mockDashboardData.items.filter((item) => item.typeId === itemType.id);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/items" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
          Back to items
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-xl">
            <span className={itemTypeColorClassNames[itemType.color] ?? "text-zinc-400"}>
              {itemType.icon}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">{itemType.name}</h1>
            <p className="text-lg text-zinc-400">{items.length} items in this type</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-0 flex items-center justify-between text-sm text-zinc-500">
              <span>{item.tags.join(" | ")}</span>
              <span>{formatDate(item.updatedAt)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
