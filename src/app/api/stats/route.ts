import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";

export async function GET(request: Request) {
  const token = bearerToken(request);
  if (!token) return Response.json({ error: "Sign in before reading analytics." }, { status: 401 });
  const botId = new URL(request.url).searchParams.get("botId") ?? undefined;
  const context = await getKnowledgeContext(token, botId);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const [documents, conversations] = await Promise.all([
    context.supabase.from("documents").select("id", { count: "exact", head: true }).eq("bot_id", context.botId).eq("processing_status", "ready"),
    context.supabase.from("conversations").select("id", { count: "exact" }).eq("bot_id", context.botId),
  ]);
  if (documents.error || conversations.error) {
    return Response.json({ error: documents.error?.message ?? conversations.error?.message }, { status: 502 });
  }
  const ids = (conversations.data ?? []).map((item) => item.id);
  if (!ids.length) return Response.json({ answers: 0, conversations: 0, groundedAnswers: 0, sources: documents.count ?? 0 });
  const [answers, grounded] = await Promise.all([
    context.supabase.from("messages").select("id", { count: "exact", head: true }).in("conversation_id", ids).eq("role", "assistant"),
    context.supabase.from("messages").select("id", { count: "exact", head: true }).in("conversation_id", ids).eq("role", "assistant").not("source_document_id", "is", null),
  ]);
  if (answers.error || grounded.error) return Response.json({ error: answers.error?.message ?? grounded.error?.message }, { status: 502 });
  return Response.json({
    answers: answers.count ?? 0,
    conversations: conversations.count ?? 0,
    groundedAnswers: grounded.count ?? 0,
    sources: documents.count ?? 0,
  });
}
