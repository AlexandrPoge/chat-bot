import { useSyncExternalStore } from "react";
import {
  BOT_SETTINGS_CHANGE_EVENT,
  BOT_SETTINGS_STORAGE_KEY,
  botSettingsSnapshot,
  defaultBotSettingsSnapshot,
  type BotSettings,
} from "@/lib/bot-settings";
import {
  KNOWLEDGE_CHANGE_EVENT,
  KNOWLEDGE_STORAGE_KEY,
  defaultKnowledgeSnapshot,
  knowledgeSnapshot,
  type KnowledgeSnapshot,
} from "@/lib/knowledge-store";

function subscribe(key: string, eventName: string, callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => { if (event.key === key) callback(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, callback);
  };
}

export function useWidgetSettings(): BotSettings {
  const snapshot = useSyncExternalStore(
    (callback) => subscribe(BOT_SETTINGS_STORAGE_KEY, BOT_SETTINGS_CHANGE_EVENT, callback),
    botSettingsSnapshot,
    () => defaultBotSettingsSnapshot,
  );
  return JSON.parse(snapshot) as BotSettings;
}

export function useWidgetKnowledge(): KnowledgeSnapshot {
  const snapshot = useSyncExternalStore(
    (callback) => subscribe(KNOWLEDGE_STORAGE_KEY, KNOWLEDGE_CHANGE_EVENT, callback),
    knowledgeSnapshot,
    () => defaultKnowledgeSnapshot,
  );
  return JSON.parse(snapshot) as KnowledgeSnapshot;
}
