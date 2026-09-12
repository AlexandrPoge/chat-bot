import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type Workspace = { id: string };
type Bot = { id: string };

function cleanFileName(value: string) {
  const safe = value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return safe.slice(-120) || "source";
}

function splitIntoChunks(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const chunks: string[] = [];
  for (let start = 0; start < clean.length; start += 1_100) {
    chunks.push(clean.slice(start, start + 1_100));
  }
  return chunks.slice(0, 20);
}

async function requireOwnedBot(token: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { error: "Supabase server keys are not configured.", status: 503 as const };

  const { data: auth, error: authError } = await supabase.auth.getUser(token);
  if (authError || !auth.user) return { error: "Your Supabase session has expired. Please sign in again.", status: 401 as const };

  const { data: existingWorkspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", auth.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Workspace>();
  if (workspaceError) return { error: workspaceError.message, status: 500 as const };

  let workspace = existingWorkspace;
  if (!workspace) {
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ owner_id: auth.user.id, name: "Helpwise workspace" })
      .select("id")
      .single<Workspace>();
    if (error || !data) return { error: error?.message ?? "Could not create the workspace.", status: 500 as const };
    workspace = data;
  }

  const { data: existingBot, error: botError } = await supabase
    .from("bots")
    .select("id")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Bot>();
  if (botError) return { error: botError.message, status: 500 as const };

  let bot = existingBot;
  if (!bot) {
    const { data, error } = await supabase
      .from("bots")
      .insert({ workspace_id: workspace.id, name: "Orbit support", welcome_message: "Hi! How can I help?" })
      .select("id")
      .single<Bot>();
    if (error || !data) return { error: error?.message ?? "Could not create the bot.", status: 500 as const };
    bot = data;
  }

  return { supabase, bot, status: 200 as const };
}

function bearerToken(request: Request) {
  const value = request.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7) : "";
}

export async function GET(request: Request) {
  const token = bearerToken(request);
  if (!token) return Response.json({ error: "Sign in before reading cloud sources." }, { status: 401 });

  const context = await requireOwnedBot(token);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  const { data, error } = await context.supabase
    .from("documents")
    .select("id, filename, byte_size, processing_status, extracted_text")
    .eq("bot_id", context.bot.id)
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 502 });

  return Response.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const token = bearerToken(request);
  if (!token) return Response.json({ error: "Sign in before uploading a source." }, { status: 401 });

  const context = await requireOwnedBot(token);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  const extractedText = typeof form.get("extractedText") === "string" ? String(form.get("extractedText")).slice(0, 12_000) : "";
  if (!(file instanceof File)) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: "The maximum source file size is 10 MB." }, { status: 413 });
  if (file.type && !ACCEPTED_TYPES.has(file.type)) return Response.json({ error: "Use a PDF, DOCX, TXT, or Markdown file." }, { status: 415 });

  const documentId = crypto.randomUUID();
  const filename = cleanFileName(file.name);
  const storagePath = `${context.bot.id}/${documentId}/${filename}`;
  const { error: uploadError } = await context.supabase.storage
    .from("knowledge-files")
    .upload(storagePath, await file.arrayBuffer(), { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) return Response.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 502 });

  const { error: documentError } = await context.supabase
    .from("documents")
    .insert({
      id: documentId,
      bot_id: context.bot.id,
      filename: file.name,
      mime_type: file.type || null,
      storage_path: storagePath,
      byte_size: file.size,
      processing_status: "ready",
      extracted_text: extractedText || null,
    });
  if (documentError) {
    await context.supabase.storage.from("knowledge-files").remove([storagePath]);
    return Response.json({ error: `Document record failed: ${documentError.message}` }, { status: 502 });
  }

  const chunks = splitIntoChunks(extractedText).map((content, chunkIndex) => ({
    document_id: documentId,
    bot_id: context.bot.id,
    content,
    chunk_index: chunkIndex,
  }));
  if (chunks.length) {
    const { error: chunkError } = await context.supabase.from("document_chunks").insert(chunks);
    if (chunkError) {
      await context.supabase.from("documents").update({ processing_status: "failed" }).eq("id", documentId);
      return Response.json({ error: `File saved, but text indexing failed: ${chunkError.message}` }, { status: 502 });
    }
  }

  return Response.json({ id: documentId, storagePath, status: "ready" }, { status: 201 });
}
