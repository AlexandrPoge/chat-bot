import { useEffect, useState } from "react";
import { DEFAULT_BOT_SETTINGS, type BotSettings, writeBotSettings } from "@/lib/bot-settings";
import { createBot, fetchBots, updateBot } from "../bot-api";
import type { CloudBot, Plan } from "../types";

function settingsFor(bot?: CloudBot): BotSettings {
  return bot ? { name: bot.name, welcome: bot.welcome_message, accent: bot.accent_color } : DEFAULT_BOT_SETTINGS;
}

export function useDashboardBots(notify: (message: string) => void) {
  const [bots, setBots] = useState<CloudBot[]>([]);
  const [activeId, setActiveId] = useState("");
  const activeBot = bots.find((bot) => bot.id === activeId) ?? bots[0];

  useEffect(() => {
    let cancelled = false;
    void fetchBots().then((items) => {
      if (cancelled) return;
      setBots(items);
      setActiveId(items[0]?.id ?? "");
      writeBotSettings(settingsFor(items[0]));
    }).catch((error) => notify(error instanceof Error ? error.message : "Could not load bots."));
    return () => { cancelled = true; };
  }, [notify]);

  const select = (id: string) => {
    const selected = bots.find((bot) => bot.id === id);
    if (!selected) return;
    setActiveId(id);
    writeBotSettings(settingsFor(selected));
  };
  const add = async () => {
    try {
      const bot = await createBot(`Support bot ${bots.length + 1}`);
      setBots((items) => [...items, bot]);
      setActiveId(bot.id);
      writeBotSettings(settingsFor(bot));
      notify("New bot created in Supabase.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not create a bot.");
    }
  };
  const saveSettings = async (settings: BotSettings) => {
    writeBotSettings(settings);
    if (!activeBot) return;
    setBots((items) => items.map((bot) => bot.id === activeBot.id ? { ...bot, name: settings.name, welcome_message: settings.welcome, accent_color: settings.accent } : bot));
    try { await updateBot(activeBot.id, settings); } catch (error) { notify(error instanceof Error ? error.message : "Settings were not synced."); }
  };
  const savePlan = async (plan: Plan) => {
    if (!activeBot) return;
    setBots((items) => items.map((bot) => bot.id === activeBot.id ? { ...bot, plan } : bot));
    try { await updateBot(activeBot.id, undefined, plan); } catch (error) { notify(error instanceof Error ? error.message : "Plan was not synced."); }
  };
  return { activeBot, activeId, add, bots, plan: activeBot?.plan ?? "Starter", savePlan, saveSettings, select, settings: settingsFor(activeBot) };
}
