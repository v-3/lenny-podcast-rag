import { Redis } from "@upstash/redis";

// Redis is optional - returns null if not configured
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export default redis;

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const RATE_LIMIT_TTL = 60 * 60; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 queries per hour

export interface CachedResult {
  response: string;
  sources: {
    guest: string;
    title: string;
    timestamp: string;
    youtubeUrl: string;
    speaker: string;
    snippet: string;
  }[];
}

export async function getCachedResponse(
  query: string
): Promise<CachedResult | null> {
  if (!redis) return null;
  const key = `cache:${hashQuery(query)}`;
  return redis.get<CachedResult>(key);
}

export async function setCachedResponse(
  query: string,
  response: string,
  sources: CachedResult["sources"]
): Promise<void> {
  if (!redis) return;
  const key = `cache:${hashQuery(query)}`;
  await redis.set(key, { response, sources }, { ex: CACHE_TTL });
}

export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) return { allowed: true, remaining: RATE_LIMIT_MAX };

  const key = `ratelimit:${userId}`;
  const current = await redis.incr(key);

  // Set TTL on first request
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_TTL);
  }

  return {
    allowed: current <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - current),
  };
}

function hashQuery(query: string): string {
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
