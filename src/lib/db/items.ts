import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getTypeBorderClassName, getTypeIconClassName } from "@/lib/db/type-styles";

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
