import "server-only";

import { cache } from "react";
import { getTypeIconClassName } from "@/lib/db/type-styles";
import { prisma } from "@/lib/prisma";

const PROFILE_ITEM_TYPES = [
  "snippet",
  "prompt",
  "note",
  "command",
  "link",
  "file",
  "image",
] as const;

interface ProfileItemTypeCount {
  name: string;
  iconName: string;
  iconClassName: string;
  count: number;
}

export interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    initials: string;
    createdAt: string;
    hasPassword: boolean;
    hasGitHubAccount: boolean;
  };
  stats: {
    totalItems: number;
    totalCollections: number;
    typeCounts: ProfileItemTypeCount[];
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

function formatTypeName(typeName: string) {
  return typeName.charAt(0).toUpperCase() + typeName.slice(1);
}

export const getProfileData = cache(async (userId: string): Promise<ProfileData> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  const [totalItems, totalCollections, itemTypes] = await Promise.all([
    prisma.item.count({
      where: {
        userId,
      },
    }),
    prisma.collection.count({
      where: {
        userId,
      },
    }),
    prisma.itemType.findMany({
      where: {
        isSystem: true,
        name: {
          in: [...PROFILE_ITEM_TYPES],
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
        icon: true,
        _count: {
          select: {
            items: {
              where: {
                userId,
              },
            },
          },
        },
      },
    }),
  ]);

  const typeCountByName = new Map(
    itemTypes.map((itemType) => [
      itemType.name,
      {
        iconName: itemType.icon ?? "Circle",
        count: itemType._count.items,
      },
    ]),
  );

  return {
    user: {
      id: user.id,
      name: user.name ?? "DevStash User",
      email: user.email,
      image: user.image,
      initials: getInitials(user.name, user.email),
      createdAt: user.createdAt.toISOString(),
      hasPassword: Boolean(user.password),
      hasGitHubAccount: user.accounts.some((account) => account.provider === "github"),
    },
    stats: {
      totalItems,
      totalCollections,
      typeCounts: PROFILE_ITEM_TYPES.map((typeName) => {
        const itemType = typeCountByName.get(typeName);

        return {
          name: formatTypeName(typeName),
          iconName: itemType?.iconName ?? "Circle",
          iconClassName: getTypeIconClassName(typeName),
          count: itemType?.count ?? 0,
        };
      }),
    },
  };
});
