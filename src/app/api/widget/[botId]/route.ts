import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, context: RouteContext<"/api/widget/[botId]">) {
  const { botId } = await context.params;
  if (!UUID.test(botId)) return Response.json({ error: "Bot not found." }, { status: 404 });
  const supabase = getSupabaseAdminClient();
  if (!supabase) return Response.json({ error: "Widget storage is unavailable." }, { status: 503 });
  const { data: bot, error } = await supabase
    .from("bots")
    .select("id, name, welcome_message, accent_color")
    .eq("id", botId)
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 502 });
  if (!bot) return Response.json({ error: "Bot not found." }, { status: 404 });

  const requested = new URL(request.url).searchParams.get("sourceId");
  let query = supabase.from("documents").select("id, filename").eq("bot_id", botId).eq("processing_status", "ready");
  if (requested && UUID.test(requested)) query = query.eq("id", requested);
  const { data: sources, error: sourceError } = await query.order("created_at", { ascending: false }).limit(1);
  return sourceError
    ? Response.json({ error: sourceError.message }, { status: 502 })
    : Response.json({ bot, source: sources?.[0] ?? null });
}
