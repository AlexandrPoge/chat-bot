import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";

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
    .select("id, name, welcome_message, accent_color, plan")
    .eq("workspace_id", context.workspaceId)
    .order("created_at", { ascending: true });
  return error ? Response.json({ error: error.message }, { status: 502 }) : Response.json({ bots: data ?? [] });
}

export async function POST(request: Request) {
  const token = tokenFor(request);
  if (!token) return Response.json({ error: "Sign in before creating a bot." }, { status: 401 });
  const context = await getKnowledgeContext(token);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const body = await request.json().catch(() => ({})) as { name?: unknown };
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 64) : "New support bot";
  const { data, error } = await context.supabase.from("bots").insert({ workspace_id: context.workspaceId, name }).select("id, name, welcome_message, accent_color, plan").single();
  return error ? Response.json({ error: error.message }, { status: 502 }) : Response.json({ bot: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const token = tokenFor(request);
  if (!token) return Response.json({ error: "Sign in before updating a bot." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return Response.json({ error: "A bot id is required." }, { status: 400 });
  const context = await getKnowledgeContext(token, id);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const updates: Record<string, string> = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim().slice(0, 64);
  if (typeof body.welcome === "string" && body.welcome.trim()) updates.welcome_message = body.welcome.trim().slice(0, 400);
  if (typeof body.accent === "string" && /^#[0-9A-Fa-f]{6}$/.test(body.accent)) updates.accent_color = body.accent;
  if (body.plan === "Starter" || body.plan === "Pro") updates.plan = body.plan;
  const { data, error } = await context.supabase.from("bots").update(updates).eq("id", context.botId).select("id, name, welcome_message, accent_color, plan").single();
  return error ? Response.json({ error: error.message }, { status: 502 }) : Response.json({ bot: data });
}
