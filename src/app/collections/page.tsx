import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { getTypeBorderClassName } from "@/lib/db/type-styles";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function getPrimaryTypeName(
  items: Array<{
    type: {
      name: string;
    };
  }>,
) {
  const typeCounts = new Map<string, number>();

  for (const item of items) {
    typeCounts.set(item.type.name, (typeCounts.get(item.type.name) ?? 0) + 1);
  }

  return [...typeCounts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0]);
  })[0]?.[0] ?? null;
}

export default async function CollectionsPage() {
  const currentUser = await getCurrentUser();
  const collections = await prisma.collection.findMany({
    where: {
      user: {
        email: currentUser.email,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        select: {
          type: {
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
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">Collections</h1>
        <p className="text-lg text-zinc-400">Browse and organize grouped knowledge.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => {
          const href = `/collections/${slugify(collection.name)}`;
          const borderClassName = getTypeBorderClassName(getPrimaryTypeName(collection.items));

          return (
            <Link key={collection.id} href={href} className="block">
              <Card
                className={`relative h-full overflow-hidden border-white/10 bg-black/20 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:content-[''] ${borderClassName}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span>{collection.name}</span>
                    {collection.isFavorite ? (
                      <span className="text-sm text-yellow-300">*</span>
                    ) : null}
                  </CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-0 text-sm text-zinc-400">
                  {collection._count.items} items
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
