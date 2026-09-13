import { useEffect, useState } from "react";
import { DEFAULT_BOT_SETTINGS, type BotSettings } from "@/lib/bot-settings";
import { createBot, deleteBot, fetchBots, updateBot } from "../bot-api";
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
    }).catch((error) => notify(error instanceof Error ? error.message : "Could not load bots."));
    return () => { cancelled = true; };
  }, [notify]);

  const select = (id: string) => {
    const selected = bots.find((bot) => bot.id === id);
    if (!selected) return;
    setActiveId(id);
  };
  const add = async () => {
    try {
      const bot = await createBot(`Support bot ${bots.length + 1}`);
      setBots((items) => [...items, bot]);
      setActiveId(bot.id);
      notify("New bot created in Supabase.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not create a bot.");
    }
  };
  const remove = async () => {
    if (!activeBot || bots.length <= 1) return;
    try {
      await deleteBot(activeBot.id);
      const remaining = bots.filter((bot) => bot.id !== activeBot.id);
      setBots(remaining);
      setActiveId(remaining[0].id);
      notify("Bot and its cloud data were deleted.");
    } catch (error) { notify(error instanceof Error ? error.message : "Could not delete the bot."); }
  };
  const saveSettings = async (settings: BotSettings) => {
    if (!activeBot) return false;
    const normalized = { ...settings, name: settings.name.trim().slice(0, 64), welcome: settings.welcome.trim().slice(0, 400) };
    if (!normalized.name || !normalized.welcome) { notify("Bot name and welcome message are required."); return false; }
    try {
      const saved = await updateBot(activeBot.id, normalized);
      setBots((items) => items.map((bot) => bot.id === saved.id ? saved : bot));
      return true;
    } catch (error) { notify(error instanceof Error ? error.message : "Settings were not synced."); return false; }
  };
  const applyPlan = (plan: Plan) => {
    if (!activeBot) return;
    setBots((items) => items.map((bot) => ({ ...bot, plan })));
  };
  const savePublished = async (published: boolean) => {
    if (!activeBot) return false;
    try {
      const saved = await updateBot(activeBot.id, undefined, published);
      setBots((items) => items.map((bot) => bot.id === saved.id ? saved : bot));
      return true;
    } catch (error) { notify(error instanceof Error ? error.message : "Publishing failed."); return false; }
  };
  return { activeBot, activeId, add, applyPlan, bots, plan: activeBot?.plan ?? "Starter", remove, savePublished, saveSettings, select, settings: settingsFor(activeBot) };
}
