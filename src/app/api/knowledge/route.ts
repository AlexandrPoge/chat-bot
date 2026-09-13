import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";
import { ACCEPTED_TYPES, MAX_FILE_SIZE, storeKnowledgeFile } from "@/lib/knowledge/upload";

function unauthorized(message: string) {
  return Response.json({ error: message }, { status: 401 });
}

async function contextFor(request: Request) {
  const token = bearerToken(request);
  const botId = new URL(request.url).searchParams.get("botId") ?? undefined;
  return token ? getKnowledgeContext(token, botId) : undefined;
}

export async function GET(request: Request) {
  const context = await contextFor(request);
  if (!context) return unauthorized("Sign in before reading cloud sources.");
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  const { data, error } = await context.supabase
    .from("documents")
    .select("id, filename, byte_size, processing_status, extracted_text")
    .eq("bot_id", context.botId)
    .order("created_at", { ascending: false });
  return error
    ? Response.json({ error: error.message }, { status: 502 })
    : Response.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const context = await contextFor(request);
  if (!context) return unauthorized("Sign in before uploading a source.");
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const file = form.get("file");
  const extractedText = typeof form.get("extractedText") === "string"
    ? String(form.get("extractedText")).slice(0, 12_000)
    : "";
  if (!(file instanceof File)) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: "The maximum source file size is 10 MB." }, { status: 413 });
  if (file.type && !ACCEPTED_TYPES.has(file.type)) {
    return Response.json({ error: "Use a PDF, DOCX, TXT, or Markdown file." }, { status: 415 });
  }

  const result = await storeKnowledgeFile(context, file, extractedText);
  return "error" in result
    ? Response.json(result, { status: 502 })
    : Response.json({ ...result, status: "ready" }, { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await contextFor(request);
  if (!context) return unauthorized("Sign in before deleting a source.");
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "A document id is required." }, { status: 400 });
  const { data, error } = await context.supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .eq("bot_id", context.botId)
    .maybeSingle<{ storage_path: string }>();
  if (error) return Response.json({ error: error.message }, { status: 502 });
  if (!data) return Response.json({ error: "Source not found." }, { status: 404 });
  const { error: storageError } = await context.supabase.storage.from("knowledge-files").remove([data.storage_path]);
  if (storageError) return Response.json({ error: storageError.message }, { status: 502 });
  const { error: deleteError } = await context.supabase.from("documents").delete().eq("id", id).eq("bot_id", context.botId);
  return deleteError ? Response.json({ error: deleteError.message }, { status: 502 }) : Response.json({ deleted: true });
}
