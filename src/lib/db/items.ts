import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  getTypeBorderClassName,
  getTypeDotClassName,
  getTypeIconClassName,
} from "@/lib/db/type-styles";

const DEMO_USER_EMAIL = "demo@devstash.io";

export interface DashboardItemCard {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: string;
  typeName: string;
  typeIconName: string;
  typeIconClassName: string;
  borderClassName: string;
  tags: string[];
}

export interface DashboardItemsData {
  pinnedItems: DashboardItemCard[];
  recentItems: DashboardItemCard[];
}

export interface DashboardSidebarItemType {
  id: string;
  name: string;
  iconName: string;
  iconClassName: string;
  itemCount: number;
}

export interface DashboardSidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  primaryTypeDotClassName: string;
}

export interface DashboardSidebarUser {
  name: string;
  email: string;
  initials: string;
  isPro: boolean;
}

export interface DashboardSidebarData {
  itemTypes: DashboardSidebarItemType[];
  recentCollections: DashboardSidebarCollection[];
  favoriteCollections: DashboardSidebarCollection[];
  collections: DashboardSidebarCollection[];
  user: DashboardSidebarUser;
}

function mapItemCard(
  item: {
    id: string;
    title: string;
    description: string | null;
    isFavorite: boolean;
    isPinned: boolean;
    updatedAt: Date;
    type: {
      name: string;
      icon: string | null;
    };
    tags: Array<{
      tag: {
        name: string;
      };
    }>;
  },
): DashboardItemCard {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    updatedAt: item.updatedAt.toISOString(),
    typeName: item.type.name,
    typeIconName: item.type.icon ?? "Circle",
    typeIconClassName: getTypeIconClassName(item.type.name),
    borderClassName: getTypeBorderClassName(item.type.name),
    tags: item.tags.map((entry) => entry.tag.name),
  };
}

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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

function mapSidebarCollection(
  collection: {
    id: string;
    name: string;
    isFavorite: boolean;
    items: Array<{
      type: {
        name: string;
      };
    }>;
  },
): DashboardSidebarCollection {
  const primaryTypeName = getPrimaryTypeName(collection.items);

  return {
    id: collection.id,
    name: collection.name,
    isFavorite: collection.isFavorite,
    itemCount: collection.items.length,
    primaryTypeDotClassName: getTypeDotClassName(primaryTypeName),
  };
}

export const getDashboardItemsData = cache(async (): Promise<DashboardItemsData> => {
  const [pinnedItems, recentItems] = await Promise.all([
    prisma.item.findMany({
      where: {
        user: {
          email: DEMO_USER_EMAIL,
        },
        isPinned: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        isFavorite: true,
        isPinned: true,
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
    }),
    prisma.item.findMany({
      where: {
        user: {
          email: DEMO_USER_EMAIL,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        isFavorite: true,
        isPinned: true,
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
    }),
  ]);

  return {
    pinnedItems: pinnedItems.map(mapItemCard),
    recentItems: recentItems.map(mapItemCard),
  };
});

export const getDashboardSidebarData = cache(async (): Promise<DashboardSidebarData> => {
  const [user, itemTypes, collections] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: {
        email: DEMO_USER_EMAIL,
      },
      select: {
        name: true,
        email: true,
        isPro: true,
      },
    }),
    prisma.itemType.findMany({
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
        items: {
          where: {
            user: {
              email: DEMO_USER_EMAIL,
            },
          },
          select: {
            id: true,
          },
        },
      },
    }),
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
        isFavorite: true,
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
    }),
  ]);

  const sidebarCollections = collections.map(mapSidebarCollection);

  return {
    itemTypes: itemTypes.map((itemType) => ({
      id: itemType.id,
      name: itemType.name,
      iconName: itemType.icon ?? "Circle",
      iconClassName: getTypeIconClassName(itemType.name),
      itemCount: itemType.items.length,
    })),
    recentCollections: sidebarCollections.slice(0, 3),
    favoriteCollections: sidebarCollections.filter((collection) => collection.isFavorite),
    collections: sidebarCollections,
    user: {
      name: user.name ?? "DevStash User",
      email: user.email,
      initials: getInitials(user.name, user.email),
      isPro: user.isPro,
    },
  };
});
