import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";
import { serviceError } from "@/lib/http-error";

const BOT_FIELDS = "id, name, welcome_message, accent_color, plan, is_published";

function tokenFor(request: Request) {
  const token = bearerToken(request);
  return token ? token : undefined;
}

export async function GET(request: Request) {
  const token = tokenFor(request);
  if (!token) return Response.json({ error: "Sign in before reading bots." }, { status: 401 });
  const context = await getKnowledgeContext(token);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const { data, error } = await context.supabase
    .from("bots")
    .select(BOT_FIELDS)
    .eq("workspace_id", context.workspaceId)
    .order("created_at", { ascending: true });
  return error ? serviceError("Bot list failed", error) : Response.json({ bots: data ?? [] });
}

export async function POST(request: Request) {
  const token = tokenFor(request);
  if (!token) return Response.json({ error: "Sign in before creating a bot." }, { status: 401 });
  const context = await getKnowledgeContext(token);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const { data: existing, error: countError } = await context.supabase.from("bots").select("plan").eq("workspace_id", context.workspaceId);
  if (countError) return serviceError("Bot limit lookup failed", countError);
  const plan = existing?.some((bot) => bot.plan === "Pro") ? "Pro" : "Starter";
  const limit = plan === "Pro" ? 5 : 1;
  if ((existing?.length ?? 0) >= limit) return Response.json({ error: `${plan} allows up to ${limit} active bot${limit > 1 ? "s" : ""}.` }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { name?: unknown };
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 64) : "New support bot";
  const { data, error } = await context.supabase.from("bots").insert({ workspace_id: context.workspaceId, name, plan }).select(BOT_FIELDS).single();
  return error ? serviceError("Bot creation failed", error) : Response.json({ bot: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const token = tokenFor(request);
  if (!token) return Response.json({ error: "Sign in before updating a bot." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return Response.json({ error: "A bot id is required." }, { status: 400 });
  const context = await getKnowledgeContext(token, id);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  if (body.published === true) {
    const { count, error } = await context.supabase.from("documents").select("id", { count: "exact", head: true }).eq("bot_id", context.botId).eq("processing_status", "ready");
    if (error) return serviceError("Widget source check failed", error);
    if (!count) return Response.json({ error: "Add a ready knowledge source before publishing." }, { status: 409 });
  }
  const updates: Record<string, string | boolean> = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim().slice(0, 64);
  if (typeof body.welcome === "string" && body.welcome.trim()) updates.welcome_message = body.welcome.trim().slice(0, 400);
  if (typeof body.accent === "string" && /^#[0-9A-Fa-f]{6}$/.test(body.accent)) updates.accent_color = body.accent;
  if (typeof body.published === "boolean") updates.is_published = body.published;
  if (!Object.keys(updates).length) return Response.json({ error: "No valid bot changes were provided." }, { status: 400 });
  const { data, error } = await context.supabase.from("bots").update(updates).eq("id", context.botId).select(BOT_FIELDS).single();
  return error ? serviceError("Bot update failed", error) : Response.json({ bot: data });
}

export async function DELETE(request: Request) {
  const token = tokenFor(request);
  if (!token) return Response.json({ error: "Sign in before deleting a bot." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return Response.json({ error: "A bot id is required." }, { status: 400 });
  const context = await getKnowledgeContext(token, id);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const { count, error: countError } = await context.supabase.from("bots").select("id", { count: "exact", head: true }).eq("workspace_id", context.workspaceId);
  if (countError) return serviceError("Bot delete count failed", countError);
  if ((count ?? 0) <= 1) return Response.json({ error: "Keep at least one bot in the workspace." }, { status: 409 });
  const { data: documents, error: sourceError } = await context.supabase.from("documents").select("storage_path").eq("bot_id", context.botId);
  if (sourceError) return serviceError("Bot source cleanup lookup failed", sourceError);
  const paths = (documents ?? []).map((document) => document.storage_path);
  if (paths.length) {
    const { error } = await context.supabase.storage.from("knowledge-files").remove(paths);
    if (error) return serviceError("Bot source cleanup failed", error);
  }
  const { error } = await context.supabase.from("bots").delete().eq("id", context.botId);
  return error ? serviceError("Bot deletion failed", error) : Response.json({ deleted: true });
}
