import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";
import { extractTrustedText } from "@/lib/knowledge/extract";
import { serviceError } from "@/lib/http-error";
import { MAX_FILE_SIZE, storeKnowledgeFile } from "@/lib/knowledge/upload";

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
    ? serviceError("Knowledge list failed", error)
    : Response.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const context = await contextFor(request);
  if (!context) return unauthorized("Sign in before uploading a source.");
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  const [bot, sourceCount] = await Promise.all([
    context.supabase.from("bots").select("plan").eq("id", context.botId).single<{ plan: string }>(),
    context.supabase.from("documents").select("id", { count: "exact", head: true }).eq("bot_id", context.botId),
  ]);
  if (bot.error || sourceCount.error) return serviceError("Knowledge limit lookup failed", bot.error ?? sourceCount.error);
  if (bot.data.plan === "Starter" && (sourceCount.count ?? 0) >= 20) {
    return Response.json({ error: "Starter allows up to 20 knowledge sources." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_FILE_SIZE + 512_000) return Response.json({ error: "The maximum source file size is 10 MB." }, { status: 413 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: "The maximum source file size is 10 MB." }, { status: 413 });
  const extracted = await extractTrustedText(file);
  if ("error" in extracted) return Response.json({ error: extracted.error }, { status: 415 });

  const result = await storeKnowledgeFile(context, file, extracted.text);
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
  if (error) return serviceError("Knowledge delete lookup failed", error);
  if (!data) return Response.json({ error: "Source not found." }, { status: 404 });
  const { error: storageError } = await context.supabase.storage.from("knowledge-files").remove([data.storage_path]);
  if (storageError) return serviceError("Knowledge storage delete failed", storageError);
  const { error: deleteError } = await context.supabase.from("documents").delete().eq("id", id).eq("bot_id", context.botId);
  return deleteError ? serviceError("Knowledge row delete failed", deleteError) : Response.json({ deleted: true });
}
