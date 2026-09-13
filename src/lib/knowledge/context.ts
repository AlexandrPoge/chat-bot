import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Workspace = { id: string };
type Bot = { id: string };

export type KnowledgeContext = {
  botId: string;
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
  workspaceId: string;
};

export type ContextResult = KnowledgeContext | { error: string; status: number };
type IdResult = { id: string } | { error: string; status: number };

async function workspaceIdFor(context: KnowledgeContext, ownerId: string): Promise<IdResult> {
  const { data, error } = await context.supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Workspace>();
  if (error) { console.error("Workspace lookup failed", error); return { error: "Workspace storage is unavailable.", status: 500 }; }
  if (data) return { id: data.id };

  const created = await context.supabase
    .from("workspaces")
    .insert({ owner_id: ownerId, name: "Helpwise workspace" })
    .select("id")
    .single<Workspace>();
  if (created.error || !created.data) {
    console.error("Workspace creation failed", created.error);
    return { error: "Could not create the workspace.", status: 500 };
  }
  return { id: created.data.id };
}

async function botIdFor(context: KnowledgeContext, workspaceId: string, requestedBotId?: string): Promise<IdResult> {
  if (requestedBotId) {
    const requested = await context.supabase.from("bots").select("id").eq("id", requestedBotId).eq("workspace_id", workspaceId).maybeSingle<Bot>();
    if (requested.error) { console.error("Bot ownership lookup failed", requested.error); return { error: "Bot storage is unavailable.", status: 500 }; }
    return requested.data ? { id: requested.data.id } : { error: "Bot not found in this workspace.", status: 404 };
  }
  const { data, error } = await context.supabase
    .from("bots")
    .select("id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Bot>();
  if (error) { console.error("Bot lookup failed", error); return { error: "Bot storage is unavailable.", status: 500 }; }
  if (data) return { id: data.id };

  const created = await context.supabase
    .from("bots")
    .insert({ workspace_id: workspaceId, name: "Orbit support", welcome_message: "Hi! How can I help?" })
    .select("id")
    .single<Bot>();
  if (created.error || !created.data) {
    console.error("Bot creation failed", created.error);
    return { error: "Could not create the bot.", status: 500 };
  }
  return { id: created.data.id };
}

export async function getKnowledgeContext(token: string, requestedBotId?: string): Promise<ContextResult> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { error: "Supabase server keys are not configured.", status: 503 };
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { error: "Your Supabase session has expired. Please sign in again.", status: 401 };

  const context: KnowledgeContext = { supabase, botId: "", workspaceId: "" };
  const workspace = await workspaceIdFor(context, data.user.id);
  if ("error" in workspace) return { error: workspace.error, status: workspace.status };
  const bot = await botIdFor(context, workspace.id, requestedBotId);
  return "error" in bot ? { error: bot.error, status: bot.status } : { ...context, botId: bot.id, workspaceId: workspace.id };
}

export function bearerToken(request: Request) {
  const value = request.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7) : "";
}
