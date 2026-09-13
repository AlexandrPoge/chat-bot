import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Exchange = {
  answer: string;
  botId: string;
  conversationId?: string;
  documentId?: string;
  question: string;
  visitorId?: string;
};

export async function recordChatExchange(exchange: Exchange) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !exchange.documentId) return undefined;
  const { data: document } = await supabase
    .from("documents")
    .select("id, bot_id")
    .eq("id", exchange.documentId)
    .eq("bot_id", exchange.botId)
    .maybeSingle<{ id: string; bot_id: string }>();
  if (!document) return undefined;

  let conversationId = exchange.conversationId;
  if (conversationId) {
    const { data } = await supabase.from("conversations").select("id").eq("id", conversationId).eq("bot_id", document.bot_id).maybeSingle();
    if (!data) conversationId = undefined;
  }
  if (!conversationId) {
    const { data, error } = await supabase.from("conversations").insert({
      bot_id: document.bot_id,
      visitor_id: exchange.visitorId?.slice(0, 120) || "dashboard-preview",
    }).select("id").single<{ id: string }>();
    if (error || !data) return undefined;
    conversationId = data.id;
  }
  const { error } = await supabase.from("messages").insert([
    { conversation_id: conversationId, role: "user", content: exchange.question },
    { conversation_id: conversationId, role: "assistant", content: exchange.answer, source_document_id: document.id },
  ]);
  if (error) return undefined;
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  return conversationId;
}
