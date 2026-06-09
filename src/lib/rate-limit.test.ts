import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => {
  class CredentialsSignin extends Error {
    code = "credentials";
  }

  return {
    CredentialsSignin,
  };
});

import {
  createRateLimitResponse,
  getRateLimitHeaders,
  getRateLimitMessage,
  getRequestIp,
  getRetryAfterSeconds,
  type RateLimitResult,
} from "@/lib/rate-limit";

const fixedNow = 1_000;
const originalNow = Date.now;

afterEach(() => {
  vi.restoreAllMocks();
  Date.now = originalNow;
});

describe("getRequestIp", () => {
  it("reads the first forwarded IP address", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 70.41.3.18",
    });

    expect(getRequestIp(headers)).toBe("203.0.113.10");
  });

  it("falls back to null when no IP header exists", () => {
    expect(getRequestIp(new Headers())).toBeNull();
  });
});

describe("rate limit formatting helpers", () => {
  const result: RateLimitResult = {
    success: false,
    limit: 5,
    remaining: 0,
    reset: 61_000,
  };

  it("formats retry and header values from the reset timestamp", () => {
    vi.spyOn(Date, "now").mockReturnValue(fixedNow);

    expect(getRateLimitMessage(result)).toBe("Too many attempts. Please try again in 1 minute.");
    expect(getRetryAfterSeconds(result)).toBe(60);
    expect(getRateLimitHeaders(result)).toEqual({
      "Retry-After": "60",
    });
  });

  it("creates a JSON 429 response", async () => {
    vi.spyOn(Date, "now").mockReturnValue(fixedNow);

    const response = createRateLimitResponse(result);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(body.error).toBe("Too many attempts. Please try again in 1 minute.");
  });
});
