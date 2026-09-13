import { bearerToken, getKnowledgeContext } from "@/lib/knowledge/context";

type BillingBody = { botId?: unknown; plan?: unknown };

async function authorized(request: Request, botId?: string) {
  const token = bearerToken(request);
  return token ? getKnowledgeContext(token, botId) : undefined;
}

export async function GET(request: Request) {
  const botId = new URL(request.url).searchParams.get("botId") ?? undefined;
  const context = await authorized(request, botId);
  if (!context) return Response.json({ error: "Sign in before reading billing." }, { status: 401 });
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const { data, error } = await context.supabase.from("billing_events").select("id, plan, amount_cents, currency, status, provider, created_at").eq("bot_id", context.botId).order("created_at", { ascending: false }).limit(20);
  return error ? Response.json({ error: error.message }, { status: 502 }) : Response.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as BillingBody;
  const botId = typeof body.botId === "string" ? body.botId : "";
  const plan = body.plan === "Starter" ? "Starter" : body.plan === "Pro" ? "Pro" : undefined;
  if (!botId || !plan) return Response.json({ error: "A bot and valid plan are required." }, { status: 400 });
  const token = bearerToken(request);
  if (!token) return Response.json({ error: "Sign in before recording billing." }, { status: 401 });
  const context = await getKnowledgeContext(token, botId);
  if ("error" in context) return Response.json({ error: context.error }, { status: context.status });
  const { data: user } = await context.supabase.auth.getUser(token);
  if (!user.user) return Response.json({ error: "Your session expired." }, { status: 401 });
  const { error: planError } = await context.supabase.from("bots").update({ plan, updated_at: new Date().toISOString() }).eq("id", context.botId);
  if (planError) return Response.json({ error: planError.message }, { status: 502 });
  const { data: event, error } = await context.supabase.from("billing_events").insert({
    amount_cents: plan === "Pro" ? 3900 : 0,
    bot_id: context.botId,
    currency: "usd",
    plan,
    provider: "mock",
    status: "succeeded",
    user_id: user.user.id,
  }).select("id, plan, amount_cents, currency, status, provider, created_at").single();
  return Response.json({ event: event ?? null, recorded: !error, warning: error ? "Apply the latest Supabase billing migration to store payment history." : undefined });
}
