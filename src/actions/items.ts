"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { updateItem as updateItemRecord } from "@/lib/db/items";
import type { UpdateItemInput, UpdateItemResult } from "@/types/items";

const nullableTextSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => value || null);

const nullableUrlSchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.union([z.url({ error: "Enter a valid URL." }), z.literal(""), z.null(), z.undefined()]),
  )
  .transform((value) => value || null);

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: nullableTextSchema,
  content: nullableTextSchema,
  url: nullableUrlSchema,
  language: nullableTextSchema,
  tags: z.array(z.string().trim().min(1, "Tags cannot be empty.")),
});

function uniqueTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

export async function updateItem(
  itemId: string,
  data: UpdateItemInput,
): Promise<UpdateItemResult> {
  const parsedData = updateItemSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      data: null,
      error: parsedData.error.issues[0]?.message ?? "Check the item details.",
    };
  }

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to update items.",
    };
  }

  const item = await updateItemRecord(itemId, userEmail, {
    ...parsedData.data,
    tags: uniqueTags(parsedData.data.tags),
  });

  if (!item) {
    return {
      success: false,
      data: null,
      error: "Item not found.",
    };
  }

  return {
    success: true,
    data: item,
    error: null,
  };
}
