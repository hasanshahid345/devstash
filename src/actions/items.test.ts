import { afterEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  auth: vi.fn(),
}));

const itemDbMocks = vi.hoisted(() => ({
  updateItem: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMocks.auth,
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: itemDbMocks.updateItem,
}));

import { updateItem } from "@/actions/items";

afterEach(() => {
  vi.clearAllMocks();
});

describe("updateItem action", () => {
  it("returns validation errors before hitting auth or the database", async () => {
    await expect(
      updateItem("item-1", {
        title: "",
        description: null,
        content: null,
        url: null,
        language: null,
        tags: [],
      }),
    ).resolves.toEqual({
      success: false,
      data: null,
      error: "Title is required.",
    });

    expect(authMocks.auth).not.toHaveBeenCalled();
    expect(itemDbMocks.updateItem).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    authMocks.auth.mockResolvedValue(null);

    await expect(
      updateItem("item-1", {
        title: "Updated item",
        description: null,
        content: null,
        url: null,
        language: null,
        tags: [],
      }),
    ).resolves.toEqual({
      success: false,
      data: null,
      error: "You must be signed in to update items.",
    });
  });

  it("normalizes duplicate tags and returns the updated item", async () => {
    authMocks.auth.mockResolvedValue({
      user: {
        email: "demo@devstash.io",
      },
    });
    itemDbMocks.updateItem.mockResolvedValue({
      id: "item-1",
      title: "Updated item",
      description: "",
      contentType: "text",
      content: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      url: null,
      isFavorite: false,
      isPinned: false,
      language: null,
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-02T11:30:00.000Z",
      type: {
        name: "note",
        iconName: "FileText",
        iconClassName: "text-zinc-400",
      },
      collection: null,
      tags: ["react"],
    });

    const result = await updateItem("item-1", {
      title: " Updated item ",
      description: "",
      content: "",
      url: null,
      language: null,
      tags: ["react", " react ", "next"],
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Updated item");
    expect(itemDbMocks.updateItem).toHaveBeenCalledWith("item-1", "demo@devstash.io", {
      title: "Updated item",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ["react", "next"],
    });
  });
});
