import Link from "next/link";
import { DashboardLucideIcon } from "@/components/dashboard/lucide-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { getTypeIconClassName } from "@/lib/db/type-styles";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export default async function ItemsPage() {
  const currentUser = await getCurrentUser();
  const itemTypes = await prisma.itemType.findMany({
    where: {
      isSystem: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      icon: true,
      _count: {
        select: {
          items: {
            where: {
              user: {
                email: currentUser.email,
              },
            },
          },
        },
      },
    },
  });

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Items</h1>
        <p className="text-lg text-zinc-400">Browse all item types in the knowledge hub.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {itemTypes.map((itemType) => {
          const href = `/items/${slugify(itemType.name)}`;

          return (
            <Link key={itemType.id} href={href} className="block">
              <Card className="h-full border-white/10 bg-black/20 transition-colors hover:border-white/15 hover:bg-black/30">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-lg">
                      <DashboardLucideIcon
                        iconName={itemType.icon ?? "Circle"}
                        className={`size-5 ${getTypeIconClassName(itemType.name)}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{itemType.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {itemType._count.items} items
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-0">
                  <p className="text-sm text-zinc-400">
                    Open this type to inspect the matching items.
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
