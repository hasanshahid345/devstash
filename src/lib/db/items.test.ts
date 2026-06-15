import { afterEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  item: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMocks,
}));

import { getItemDetailById, updateItem } from "@/lib/db/items";

afterEach(() => {
  vi.clearAllMocks();
});

describe("getItemDetailById", () => {
  it("queries by item id and user email", async () => {
    prismaMocks.item.findFirst.mockResolvedValue(null);

    await getItemDetailById("item-1", "demo@devstash.io");

    expect(prismaMocks.item.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "item-1",
          user: {
            email: "demo@devstash.io",
          },
        },
      }),
    );
  });

  it("returns null when the item is not found", async () => {
    prismaMocks.item.findFirst.mockResolvedValue(null);

    await expect(getItemDetailById("missing", "demo@devstash.io")).resolves.toBeNull();
  });

  it("maps a Prisma item into the drawer detail payload", async () => {
    const createdAt = new Date("2026-06-01T10:00:00.000Z");
    const updatedAt = new Date("2026-06-02T11:30:00.000Z");

    prismaMocks.item.findFirst.mockResolvedValue({
      id: "item-1",
      title: "useDebounce Hook",
      description: null,
      contentType: "text",
      content: "export function useDebounce() {}",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      url: null,
      isFavorite: true,
      isPinned: false,
      language: "typescript",
      createdAt,
      updatedAt,
      type: {
        name: "snippet",
        icon: null,
      },
      collection: {
        id: "collection-1",
        name: "React Patterns",
      },
      tags: [
        {
          tag: {
            name: "react",
          },
        },
        {
          tag: {
            name: "hooks",
          },
        },
      ],
    });

    await expect(getItemDetailById("item-1", "demo@devstash.io")).resolves.toEqual({
      id: "item-1",
      title: "useDebounce Hook",
      description: "",
      contentType: "text",
      content: "export function useDebounce() {}",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      url: null,
      isFavorite: true,
      isPinned: false,
      language: "typescript",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      type: {
        name: "snippet",
        iconName: "Circle",
        iconClassName: "text-sky-400",
      },
      collection: {
        id: "collection-1",
        name: "React Patterns",
      },
      tags: ["react", "hooks"],
    });
  });
});

describe("updateItem", () => {
  it("returns null when the item does not belong to the user", async () => {
    prismaMocks.item.findFirst.mockResolvedValue(null);

    await expect(
      updateItem("item-1", "demo@devstash.io", {
        title: "Updated title",
        description: null,
        content: null,
        url: null,
        language: null,
        tags: [],
      }),
    ).resolves.toBeNull();

    expect(prismaMocks.item.update).not.toHaveBeenCalled();
  });

  it("updates item fields and replaces tags for the owning user", async () => {
    const createdAt = new Date("2026-06-01T10:00:00.000Z");
    const updatedAt = new Date("2026-06-02T11:30:00.000Z");

    prismaMocks.item.findFirst.mockResolvedValue({
      id: "item-1",
      userId: "user-1",
    });
    prismaMocks.item.update.mockResolvedValue({
      id: "item-1",
      title: "Updated title",
      description: "Updated description",
      contentType: "text",
      content: "npm run build",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      url: null,
      isFavorite: false,
      isPinned: true,
      language: "bash",
      createdAt,
      updatedAt,
      type: {
        name: "command",
        icon: "Terminal",
      },
      collection: null,
      tags: [
        {
          tag: {
            name: "build",
          },
        },
      ],
    });

    await expect(
      updateItem("item-1", "demo@devstash.io", {
        title: "Updated title",
        description: "Updated description",
        content: "npm run build",
        url: null,
        language: "bash",
        tags: ["build"],
      }),
    ).resolves.toMatchObject({
      id: "item-1",
      title: "Updated title",
      tags: ["build"],
    });

    expect(prismaMocks.item.findFirst).toHaveBeenCalledWith({
      where: {
        id: "item-1",
        user: {
          email: "demo@devstash.io",
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
    expect(prismaMocks.item.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Updated title",
          tags: {
            deleteMany: {},
            create: [
              {
                tag: {
                  connectOrCreate: {
                    where: {
                      userId_name: {
                        userId: "user-1",
                        name: "build",
                      },
                    },
                    create: {
                      name: "build",
                      userId: "user-1",
                    },
                  },
                },
              },
            ],
          },
        }),
      }),
    );
  });
});
