import { useSyncExternalStore } from "react";
import {
  BOT_SETTINGS_CHANGE_EVENT,
  BOT_SETTINGS_STORAGE_KEY,
  botSettingsSnapshot,
  defaultBotSettingsSnapshot,
  type BotSettings,
} from "@/lib/bot-settings";
import {
  DEMO_SESSION_CHANGE_EVENT,
  DEMO_SESSION_STORAGE_KEY,
  defaultDemoSessionSnapshot,
  demoSessionSnapshot,
  type DemoSession,
} from "@/lib/auth-session";

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

export function useSavedSettings(): BotSettings {
  const snapshot = useSyncExternalStore(
    (callback) => subscribe(BOT_SETTINGS_STORAGE_KEY, BOT_SETTINGS_CHANGE_EVENT, callback),
    botSettingsSnapshot,
    () => defaultBotSettingsSnapshot,
  );
  return JSON.parse(snapshot) as BotSettings;
}

export function useDemoSession(): DemoSession | null {
  const snapshot = useSyncExternalStore(
    (callback) => subscribe(DEMO_SESSION_STORAGE_KEY, DEMO_SESSION_CHANGE_EVENT, callback),
    demoSessionSnapshot,
    () => defaultDemoSessionSnapshot,
  );
  return JSON.parse(snapshot) as DemoSession | null;
}
