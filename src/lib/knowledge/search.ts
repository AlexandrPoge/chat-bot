import { embedSearchQuery } from "@/lib/ai/embeddings";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type DocumentRow = { id: string; bot_id: string; filename: string };
type MatchRow = { document_id: string; content: string; similarity: number };
export type RetrievedChunk = { content: string; filename: string; similarity: number };

export async function retrieveRelevantChunks(question: string, documentIds: string[]) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !documentIds.length) return [];
  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, bot_id, filename")
    .in("id", documentIds)
    .returns<DocumentRow[]>();
  if (error || !documents?.length) return [];

  const queryEmbedding = await embedSearchQuery(question);
  if (!queryEmbedding) return [];
  const allowed = new Set(documents.map((document) => document.id));
  const names = new Map(documents.map((document) => [document.id, document.filename]));
  const { data: matches, error: matchError } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_bot_id: documents[0].bot_id,
    match_count: 10,
  });
  if (matchError) throw matchError;
  return ((matches ?? []) as MatchRow[])
    .filter((match) => allowed.has(match.document_id))
    .slice(0, 5)
    .map((match): RetrievedChunk => ({
      content: match.content,
      filename: names.get(match.document_id) ?? "Knowledge source",
      similarity: match.similarity,
    }));
}
