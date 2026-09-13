import { useEffect, useState } from "react";
import { DEFAULT_BOT_SETTINGS, type BotSettings } from "@/lib/bot-settings";
import type { KnowledgeSource } from "@/lib/test-assistant";

type RemoteData = { settings: BotSettings; source?: KnowledgeSource & { id: number } };
type WidgetResponse = {
  bot?: { name: string; welcome_message: string; accent_color: string };
  source?: { id: string; filename: string } | null;
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function numberFromId(value: string) {
  return Math.abs([...value].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0));
}

export function usePublicWidget(botId: string, sourceId?: string) {
  const [remote, setRemote] = useState<RemoteData>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(UUID.test(botId) ? "loading" : "error");

  useEffect(() => {
    if (!UUID.test(botId)) return;
    const query = sourceId ? `?sourceId=${encodeURIComponent(sourceId)}` : "";
    let cancelled = false;
    void fetch(`/api/widget/${encodeURIComponent(botId)}${query}`).then(async (response) => {
      const body = await response.json() as WidgetResponse;
      if (!response.ok || !body.bot) { if (!cancelled) setStatus("error"); return; }
      if (cancelled) return;
      setRemote({
        settings: { name: body.bot.name, welcome: body.bot.welcome_message, accent: body.bot.accent_color },
        source: body.source ? { cloudId: body.source.id, id: numberFromId(body.source.id), name: body.source.filename, summary: "The complete source is indexed securely in Helpwise." } : undefined,
      });
      setStatus("ready");
    }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [botId, sourceId]);

  return { available: status === "ready" && Boolean(remote?.source), loading: status === "loading", settings: remote?.settings ?? DEFAULT_BOT_SETTINGS, source: remote?.source };
}
