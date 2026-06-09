import { describe, expect, it } from "vitest";
import { cn, slugify } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names with spaces", () => {
    expect(cn("px-4", false, null, "py-2", undefined, "rounded")).toBe("px-4 py-2 rounded");
  });
});

describe("slugify", () => {
  it("converts text into a lowercase kebab-case slug", () => {
    expect(slugify("  Hello, DevStash! ")).toBe("hello-devstash");
  });
});
