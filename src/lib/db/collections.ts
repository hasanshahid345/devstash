import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getTypeBorderClassName, getTypeIconClassName } from "@/lib/db/type-styles";

const DEMO_USER_EMAIL = "demo@devstash.io";

export interface DashboardCollectionTypeSummary {
  name: string;
  icon: string;
  count: number;
  iconClassName: string;
}

export interface DashboardCollectionCard {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  borderClassName: string;
  types: DashboardCollectionTypeSummary[];
}

export interface DashboardCollectionStats {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
}

export interface DashboardCollectionsData {
  collections: DashboardCollectionCard[];
  stats: DashboardCollectionStats;
}

function countTypes(
  items: Array<{
    type: {
      name: string;
      icon: string | null;
    };
  }>,
) {
  const typeCounts = new Map<string, { name: string; icon: string; count: number }>();

  for (const item of items) {
    const type = item.type;
    const existing = typeCounts.get(type.name);

    if (existing) {
      existing.count += 1;
      continue;
    }

    typeCounts.set(type.name, {
      name: type.name,
      icon: type.icon ?? "Circle",
      count: 1,
    });
  }

  const types = [...typeCounts.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.name.localeCompare(right.name);
  });

  return {
    types,
    primaryTypeName: types[0]?.name ?? null,
  };
}

export const getDashboardCollectionsData = cache(async (): Promise<DashboardCollectionsData> => {
  const [collections, favoriteItemCount] = await Promise.all([
    prisma.collection.findMany({
      where: {
        user: {
          email: DEMO_USER_EMAIL,
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
        items: {
          select: {
            type: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    }),
    prisma.item.count({
      where: {
        user: {
          email: DEMO_USER_EMAIL,
        },
        isFavorite: true,
      },
    }),
  ]);

  const collectionCards = collections.map((collection) => {
    const { types, primaryTypeName } = countTypes(collection.items);
    const itemCount = collection.items.length;

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description ?? "",
      isFavorite: collection.isFavorite,
      itemCount,
      borderClassName: getTypeBorderClassName(primaryTypeName),
      types: types.map((type) => ({
        name: type.name,
        icon: type.icon,
        count: type.count,
        iconClassName: getTypeIconClassName(type.name),
      })),
    };
  });

  const itemCount = collectionCards.reduce((total, collection) => total + collection.itemCount, 0);
  const favoriteCollectionCount = collectionCards.filter((collection) => collection.isFavorite).length;

  return {
    collections: collectionCards.slice(0, 6),
    stats: {
      itemCount,
      collectionCount: collectionCards.length,
      favoriteItemCount,
      favoriteCollectionCount,
    },
  };
});
