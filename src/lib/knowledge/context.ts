import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Workspace = { id: string };
type Bot = { id: string };

export type KnowledgeContext = {
  botId: string;
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
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
  if (error) return { error: error.message, status: 500 };
  if (data) return { id: data.id };

  const created = await context.supabase
    .from("workspaces")
    .insert({ owner_id: ownerId, name: "Helpwise workspace" })
    .select("id")
    .single<Workspace>();
  return created.error || !created.data
    ? { error: created.error?.message ?? "Could not create the workspace.", status: 500 }
    : { id: created.data.id };
}

async function botIdFor(context: KnowledgeContext, workspaceId: string): Promise<IdResult> {
  const { data, error } = await context.supabase
    .from("bots")
    .select("id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Bot>();
  if (error) return { error: error.message, status: 500 };
  if (data) return { id: data.id };

  const created = await context.supabase
    .from("bots")
    .insert({ workspace_id: workspaceId, name: "Orbit support", welcome_message: "Hi! How can I help?" })
    .select("id")
    .single<Bot>();
  return created.error || !created.data
    ? { error: created.error?.message ?? "Could not create the bot.", status: 500 }
    : { id: created.data.id };
}

export async function getKnowledgeContext(token: string): Promise<ContextResult> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { error: "Supabase server keys are not configured.", status: 503 };
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { error: "Your Supabase session has expired. Please sign in again.", status: 401 };

  const context: KnowledgeContext = { supabase, botId: "" };
  const workspace = await workspaceIdFor(context, data.user.id);
  if ("error" in workspace) return { error: workspace.error, status: workspace.status };
  const bot = await botIdFor(context, workspace.id);
  return "error" in bot ? { error: bot.error, status: bot.status } : { ...context, botId: bot.id };
}

export function bearerToken(request: Request) {
  const value = request.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7) : "";
}
