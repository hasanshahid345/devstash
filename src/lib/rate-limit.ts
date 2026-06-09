import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { CredentialsSignin } from "next-auth";

type HeaderSource = Pick<Headers, "get">;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitOptions {
  route: string;
  limit: number;
  window: Duration;
  headers: HeaderSource;
  identifier?: string;
}

const DEFAULT_PREFIX = "@upstash/ratelimit/devstash";
const limiterCache = new Map<string, Ratelimit | null>();
let redisClient: Redis | null | undefined;

export class RateLimitedCredentialsSignin extends CredentialsSignin {
  code = "rate_limited";
}

export const AUTH_RATE_LIMITS = {
  login: {
    route: "auth:login",
    limit: 5,
    window: "15 m",
  },
  register: {
    route: "auth:register",
    limit: 3,
    window: "1 h",
  },
  forgotPassword: {
    route: "auth:forgot-password",
    limit: 3,
    window: "1 h",
  },
  resetPassword: {
    route: "auth:reset-password",
    limit: 5,
    window: "15 m",
  },
  resendVerification: {
    route: "auth:resend-verification",
    limit: 3,
    window: "15 m",
  },
} as const;

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
}

function getLimiter(limit: number, window: Duration) {
  const cacheKey = `${limit}:${window}`;
  const cachedLimiter = limiterCache.get(cacheKey);

  if (cachedLimiter !== undefined) {
    return cachedLimiter;
  }

  const redis = getRedisClient();

  if (!redis) {
    limiterCache.set(cacheKey, null);
    return null;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: DEFAULT_PREFIX,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export function getRequestIp(headers: HeaderSource) {
  const forwardedFor =
    headers.get("x-forwarded-for") ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-vercel-forwarded-for");

  if (!forwardedFor) {
    return null;
  }

  const [firstIp] = forwardedFor.split(",");
  const trimmedIp = firstIp?.trim();

  return trimmedIp ? trimmedIp : null;
}

function durationToMilliseconds(window: Duration) {
  const normalizedWindow = window.replace(/\s+/g, " ").trim();
  const match = normalizedWindow.match(/^(\d+)\s*(ms|s|m|h|d)$/i);

  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "ms":
      return amount;
    case "s":
      return amount * 1_000;
    case "m":
      return amount * 60_000;
    case "h":
      return amount * 3_600_000;
    case "d":
      return amount * 86_400_000;
    default:
      return 0;
  }
}

function formatRetryTime(reset: number) {
  const secondsLeft = Math.max(0, Math.ceil((reset - Date.now()) / 1_000));

  if (secondsLeft < 60) {
    return `${secondsLeft} second${secondsLeft === 1 ? "" : "s"}`;
  }

  const minutesLeft = Math.ceil(secondsLeft / 60);

  if (minutesLeft < 60) {
    return `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`;
  }

  const hoursLeft = Math.ceil(minutesLeft / 60);

  return `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
}

export function getRateLimitMessage(result: RateLimitResult) {
  return `Too many attempts. Please try again in ${formatRetryTime(result.reset)}.`;
}

export function getRetryAfterSeconds(result: RateLimitResult) {
  return Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000));
}

export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    "Retry-After": String(getRetryAfterSeconds(result)),
  };
}

export function createRateLimitResponse(
  result: RateLimitResult,
  message = getRateLimitMessage(result),
) {
  return Response.json(
    {
      error: message,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(result),
    },
  );
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const fallbackReset = Date.now() + durationToMilliseconds(options.window);
  const clientIp = getRequestIp(options.headers);

  if (!clientIp) {
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit,
      reset: fallbackReset,
    };
  }

  const identifier = options.identifier ? normalizeIdentifier(options.identifier) : null;
  const key = identifier ? `${options.route}:${clientIp}:${identifier}` : `${options.route}:${clientIp}`;
  const limiter = getLimiter(options.limit, options.window);

  if (!limiter) {
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit,
      reset: fallbackReset,
    };
  }

  try {
    const result = await limiter.limit(key);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit,
      reset: fallbackReset,
    };
  }
}
