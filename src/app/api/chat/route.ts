import { generateGroundedAnswer } from "@/lib/ai/answer";
import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";
import { recordChatExchange } from "@/lib/knowledge/chat-persistence";
import { loadTrustedSources, retrieveRelevantChunks, type TrustedSource } from "@/lib/knowledge/search";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTestAnswer } from "@/lib/test-assistant";
import { takeChatRequest } from "@/lib/rate-limit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type ChatRequest = { botId?: unknown; conversationId?: unknown; question?: unknown; sources?: unknown; visitorId?: unknown };

function sourceIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((source) => {
    if (!source || typeof source !== "object") return [];
    const id = (source as { cloudId?: unknown }).cloudId;
    return typeof id === "string" && UUID.test(id) ? [id] : [];
  }).slice(0, 2);
}

async function canUseBot(request: Request, botId: string) {
  const token = bearerToken(request);
  if (token) return !("error" in await getKnowledgeContext(token, botId));
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;
  const { data } = await supabase.from("bots").select("id").eq("id", botId).eq("is_published", true).maybeSingle();
  return Boolean(data);
}

function fallback(question: string, sources: TrustedSource[]) {
  return getTestAnswer(question, sources, Date.now());
}

async function persist(body: ChatRequest, botId: string, source: TrustedSource, question: string, answer: string) {
  return recordChatExchange({
    answer, botId, question, documentId: source.id,
    conversationId: typeof body.conversationId === "string" ? body.conversationId : undefined,
    visitorId: typeof body.visitorId === "string" ? body.visitorId : undefined,
  }).catch((error) => { console.error("Conversation persistence failed", error); return undefined; });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 32_000) return Response.json({ error: "Chat request is too large." }, { status: 413 });
  const body = await request.json().catch(() => undefined) as ChatRequest | undefined;
  if (!body) return Response.json({ error: "The request must contain JSON." }, { status: 400 });
  const botId = typeof body.botId === "string" && UUID.test(body.botId) ? body.botId : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const ids = sourceIds(body.sources);
  if (!botId || !question || question.length > 2_000 || !ids.length) {
    return Response.json({ error: "Choose a synced source and provide a valid question." }, { status: 400 });
  }
  if (!await canUseBot(request, botId)) return Response.json({ error: "This bot is not available." }, { status: 404 });
  const limit = await takeChatRequest(request, botId);
  if (!limit.allowed) return Response.json({ error: "Too many questions. Please wait a moment." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const sources = await loadTrustedSources(botId, ids);
  if (!sources.length) return Response.json({ error: "The selected source is not available." }, { status: 404 });
  const chunks = await retrieveRelevantChunks(question, botId, sources);
  const context = chunks.length
    ? chunks.map((chunk) => `SOURCE: ${chunk.filename}\n${chunk.content}`).join("\n\n---\n\n")
    : sources.map((source) => `SOURCE: ${source.name}\n${source.summary.slice(0, 8_000)}`).join("\n\n---\n\n");
  let result: Awaited<ReturnType<typeof generateGroundedAnswer>>;
  try { result = await generateGroundedAnswer(question, context); } catch (error) { console.error("Helpwise AI response failed", error); }
  const answer = result?.text ? { content: result.text, source: sources[0].name } : fallback(question, sources);
  const conversationId = await persist(body, botId, sources[0], question, answer.content);
  return Response.json({
    answer: answer.content, conversationId, source: answer.source, mode: result ? "live" : "test",
    provider: result?.provider ?? "test", retrieval: chunks.length ? "pgvector" : "source",
  });
}
