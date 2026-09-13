import { useEffect, useState } from "react";
import type { BotSettings } from "@/lib/bot-settings";
import type { KnowledgeSource } from "@/lib/test-assistant";
import { useWidgetKnowledge, useWidgetSettings } from "./use-widget-stores";

type RemoteData = { settings: BotSettings; source?: KnowledgeSource & { id: number } };
type WidgetResponse = {
  bot?: { name: string; welcome_message: string; accent_color: string };
  source?: { id: string; filename: string } | null;
};

function numberFromId(value: string) {
  return Math.abs([...value].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0));
}

export function usePublicWidget(botId: string, sourceId?: string) {
  const localSettings = useWidgetSettings();
  const localKnowledge = useWidgetKnowledge();
  const localSource = localKnowledge.sources.find((item) => item.id === localKnowledge.activeSourceId) ?? localKnowledge.sources[0];
  const [remote, setRemote] = useState<RemoteData>();

  useEffect(() => {
    if (!botId.includes("-")) return;
    const query = sourceId ? `?sourceId=${encodeURIComponent(sourceId)}` : "";
    let cancelled = false;
    void fetch(`/api/widget/${encodeURIComponent(botId)}${query}`).then(async (response) => {
      const body = await response.json() as WidgetResponse;
      if (!response.ok || !body.bot || cancelled) return;
      setRemote({
        settings: { name: body.bot.name, welcome: body.bot.welcome_message, accent: body.bot.accent_color },
        source: body.source ? { cloudId: body.source.id, id: numberFromId(body.source.id), name: body.source.filename, summary: "The complete source is indexed securely in Helpwise." } : undefined,
      });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [botId, sourceId]);

  return { settings: remote?.settings ?? localSettings, source: remote?.source ?? localSource };
}
