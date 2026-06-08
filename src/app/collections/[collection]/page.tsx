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
  const currentUser = await getCurrentUser();
  const { collection } = await params;
  const collections = await prisma.collection.findMany({
    where: {
      user: {
        email: currentUser.email,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  const collectionData = collections.find(
    (entry) => slugify(entry.name) === collection || entry.id === collection,
  );

  if (!collectionData) {
    notFound();
  }

  const items = await prisma.item.findMany({
    where: {
      collectionId: collectionData.id,
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
      type: {
        select: {
          name: true,
          icon: true,
        },
      },
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
        <Link
          href="/collections"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Back to collections
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-white/[0.04] text-xl">
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
        {items.map((item) => (
          <Card key={item.id} className="border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DashboardLucideIcon
                  iconName={item.type.icon ?? "Circle"}
                  className={`size-5 ${getTypeIconClassName(item.type.name)}`}
                />
                <span>{item.title}</span>
              </CardTitle>
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
