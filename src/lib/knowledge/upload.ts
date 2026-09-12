import type { KnowledgeContext } from "./context";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function cleanFileName(value: string) {
  const safe = value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return safe.slice(-120) || "source";
}

function splitIntoChunks(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let start = 0; clean && start < clean.length; start += 1_100) {
    chunks.push(clean.slice(start, start + 1_100));
  }
  return chunks.slice(0, 20);
}

export async function storeKnowledgeFile(context: KnowledgeContext, file: File, extractedText: string) {
  const documentId = crypto.randomUUID();
  const storagePath = `${context.botId}/${documentId}/${cleanFileName(file.name)}`;
  const { error: uploadError } = await context.supabase.storage
    .from("knowledge-files")
    .upload(storagePath, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) return { error: `Storage upload failed: ${uploadError.message}` };

  const { error: documentError } = await context.supabase.from("documents").insert({
    id: documentId,
    bot_id: context.botId,
    filename: file.name,
    mime_type: file.type || null,
    storage_path: storagePath,
    byte_size: file.size,
    processing_status: "ready",
    extracted_text: extractedText || null,
  });
  if (documentError) {
    await context.supabase.storage.from("knowledge-files").remove([storagePath]);
    return { error: `Document record failed: ${documentError.message}` };
  }

  const chunks = splitIntoChunks(extractedText).map((content, chunkIndex) => ({
    document_id: documentId,
    bot_id: context.botId,
    content,
    chunk_index: chunkIndex,
  }));
  if (!chunks.length) return { id: documentId, storagePath };

  const { error: chunkError } = await context.supabase.from("document_chunks").insert(chunks);
  if (!chunkError) return { id: documentId, storagePath };
  await context.supabase.from("documents").update({ processing_status: "failed" }).eq("id", documentId);
  return { error: `File saved, but text indexing failed: ${chunkError.message}` };
}
