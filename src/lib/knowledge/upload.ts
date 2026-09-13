import type { KnowledgeContext } from "./context";
import { embedKnowledgeChunks } from "@/lib/ai/embeddings";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
  if (uploadError) {
    console.error("Knowledge storage upload failed", uploadError);
    return { error: "Cloud storage could not save this file." };
  }

  const { error: documentError } = await context.supabase.from("documents").insert({
    id: documentId,
    bot_id: context.botId,
    filename: file.name,
    mime_type: file.type || null,
    storage_path: storagePath,
    byte_size: file.size,
    processing_status: "processing",
    extracted_text: extractedText || null,
  });
  if (documentError) {
    console.error("Knowledge document insert failed", documentError);
    await context.supabase.storage.from("knowledge-files").remove([storagePath]);
    return { error: "The source record could not be created." };
  }

  const contents = splitIntoChunks(extractedText);
  let embeddings: number[][] = [];
  try {
    embeddings = await embedKnowledgeChunks(contents);
  } catch (error) {
    console.error("Knowledge embedding failed", error);
  }
  const chunks = contents.map((content, chunkIndex) => ({
    document_id: documentId,
    bot_id: context.botId,
    content,
    embedding: embeddings[chunkIndex] ?? null,
    chunk_index: chunkIndex,
  }));
  if (!chunks.length) {
    await context.supabase.from("documents").update({ processing_status: "ready" }).eq("id", documentId);
    return { id: documentId, indexed: false, storagePath };
  }

  const { error: chunkError } = await context.supabase.from("document_chunks").insert(chunks);
  if (chunkError) {
    console.error("Knowledge chunk insert failed", chunkError);
    await context.supabase.from("documents").delete().eq("id", documentId);
    await context.supabase.storage.from("knowledge-files").remove([storagePath]);
    return { error: "Text indexing failed. Nothing was saved; please retry." };
  }
  await context.supabase.from("documents").update({ processing_status: "ready" }).eq("id", documentId);
  return { id: documentId, indexed: embeddings.length === chunks.length, storagePath };
}
