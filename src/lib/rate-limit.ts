import { createHash } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

function takeMemoryRequest(request: Request) {
  const now = Date.now();
  const key = clientKey(request);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)) };
  }
  current.count += 1;
  if (buckets.size > 5_000) {
    for (const [bucketKey, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(bucketKey);
  }
  return { allowed: true, retryAfter: 0 };
}

export async function takeChatRequest(request: Request, botId: string) {
  const memory = takeMemoryRequest(request);
  if (!memory.allowed) return memory;
  const supabase = getSupabaseAdminClient();
  if (!supabase) return memory;
  const digest = createHash("sha256").update(clientKey(request)).digest("hex");
  const { data, error } = await supabase.rpc("consume_chat_quota", {
    request_key: `${botId}:${digest}`,
    max_requests: MAX_REQUESTS,
    window_seconds: Math.round(WINDOW_MS / 1_000),
  });
  if (error) {
    console.error("Durable chat rate limit failed", error);
    return memory;
  }
  return data === false ? { allowed: false, retryAfter: 60 } : memory;
}
