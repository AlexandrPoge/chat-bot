import { embedSearchQuery } from "@/lib/ai/embeddings";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type MatchRow = { document_id: string; content: string; similarity: number };
export type RetrievedChunk = { content: string; filename: string; similarity: number };
export type TrustedSource = { id: string; name: string; summary: string };

export async function loadTrustedSources(botId: string, documentIds: string[]): Promise<TrustedSource[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !documentIds.length) return [];
  const { data, error } = await supabase
    .from("documents")
    .select("id, filename, extracted_text")
    .eq("bot_id", botId)
    .eq("processing_status", "ready")
    .in("id", documentIds)
    .returns<{ id: string; filename: string; extracted_text: string | null }[]>();
  if (error) console.error("Trusted knowledge lookup failed", error);
  const byId = new Map((data ?? []).map((row) => [row.id, row]));
  return documentIds.flatMap((id) => {
    const row = byId.get(id);
    return row ? [{ id: row.id, name: row.filename, summary: row.extracted_text ?? "" }] : [];
  });
}

export async function retrieveRelevantChunks(question: string, botId: string, sources: TrustedSource[]) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !sources.length) return [];

  let queryEmbedding: number[] | undefined;
  try {
    queryEmbedding = await embedSearchQuery(question);
  } catch (error) {
    console.error("Knowledge query embedding failed", error);
    return [];
  }
  if (!queryEmbedding) return [];
  const allowed = new Set(sources.map((source) => source.id));
  const names = new Map(sources.map((source) => [source.id, source.name]));
  const { data: matches, error: matchError } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_bot_id: botId,
    match_document_ids: sources.map((source) => source.id),
    match_count: 10,
  });
  if (matchError) {
    console.error("Supabase vector search failed", matchError);
    return [];
  }
  return ((matches ?? []) as MatchRow[])
    .filter((match) => allowed.has(match.document_id))
    .slice(0, 5)
    .map((match): RetrievedChunk => ({
      content: match.content,
      filename: names.get(match.document_id) ?? "Knowledge source",
      similarity: match.similarity,
    }));
}
