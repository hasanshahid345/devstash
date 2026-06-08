import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardLucideIcon } from "@/components/dashboard/lucide-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { getTypeIconClassName } from "@/lib/db/type-styles";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function formatDate(dateValue: Date | string) {
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
  const currentUser = await getCurrentUser();
  const { type } = await params;
  const itemTypes = await prisma.itemType.findMany({
    where: {
      isSystem: true,
    },
    select: {
      id: true,
      name: true,
      icon: true,
    },
  });
  const itemType = itemTypes.find((entry) => slugify(entry.name) === type || entry.id === type);

  if (!itemType) {
    notFound();
  }

  const items = await prisma.item.findMany({
    where: {
      typeId: itemType.id,
      user: {
        email: currentUser.email,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      updatedAt: true,
      tags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/items" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
          Back to items
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-xl">
            <DashboardLucideIcon
              iconName={itemType.icon ?? "Circle"}
              className={`size-5 ${getTypeIconClassName(itemType.name)}`}
            />
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
              <span>{item.tags.map((entry) => entry.tag.name).join(" | ")}</span>
              <span>{formatDate(item.updatedAt)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
