import { afterEach, describe, expect, it, vi } from "vitest";
import type { ItemDetail } from "@/types/items";

const authMocks = vi.hoisted(() => ({
  auth: vi.fn(),
}));

const itemMocks = vi.hoisted(() => ({
  getItemDetailById: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMocks.auth,
}));

vi.mock("@/lib/db/items", () => ({
  getItemDetailById: itemMocks.getItemDetailById,
}));

import { GET } from "@/app/api/items/[id]/route";

const itemDetail: ItemDetail = {
  id: "item-1",
  title: "useDebounce Hook",
  description: "A reusable debounce hook.",
  contentType: "text",
  content: "export function useDebounce() {}",
  fileUrl: null,
  fileName: null,
  fileSize: null,
  url: null,
  isFavorite: true,
  isPinned: true,
  language: "typescript",
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-02T10:00:00.000Z",
  type: {
    name: "snippet",
    iconName: "Code",
    iconClassName: "text-sky-400",
  },
  collection: {
    id: "collection-1",
    name: "React Patterns",
  },
  tags: ["react", "hooks"],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/items/[id]", () => {
  it("returns 401 when the user is not authenticated", async () => {
    authMocks.auth.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/items/item-1"), {
      params: Promise.resolve({ id: "item-1" }),
    });

    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(response.status).toBe(401);
    expect(itemMocks.getItemDetailById).not.toHaveBeenCalled();
  });

  it("returns 404 when the item is not found for the authenticated user", async () => {
    authMocks.auth.mockResolvedValue({ user: { email: "demo@devstash.io" } });
    itemMocks.getItemDetailById.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/items/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    await expect(response.json()).resolves.toEqual({ error: "Item not found" });
    expect(response.status).toBe(404);
    expect(itemMocks.getItemDetailById).toHaveBeenCalledWith("missing", "demo@devstash.io");
  });

  it("returns the item detail payload for an authenticated user", async () => {
    authMocks.auth.mockResolvedValue({ user: { email: "demo@devstash.io" } });
    itemMocks.getItemDetailById.mockResolvedValue(itemDetail);

    const response = await GET(new Request("http://localhost/api/items/item-1"), {
      params: Promise.resolve({ id: "item-1" }),
    });

    await expect(response.json()).resolves.toEqual({ item: itemDetail });
    expect(response.status).toBe(200);
  });
});
