export type BotSettings = {
  name: string;
  welcome: string;
  accent: string;
};

export const BOT_SETTINGS_STORAGE_KEY = "helpwise-bot-settings";
export const BOT_SETTINGS_CHANGE_EVENT = "helpwise:bot-settings-change";

export const DEFAULT_BOT_SETTINGS: BotSettings = {
  name: "Orbit support",
  welcome: "Hi! I’m Orbit. Ask me anything about the product, account, or billing.",
  accent: "#D9FB97",
};

function isBotSettings(value: unknown): value is BotSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as BotSettings;
  return typeof settings.name === "string" && typeof settings.welcome === "string" && /^#[0-9A-Fa-f]{6}$/.test(settings.accent);
}

export function readBotSettings(): BotSettings {
  if (typeof window === "undefined") return DEFAULT_BOT_SETTINGS;

  try {
    const saved = window.localStorage.getItem(BOT_SETTINGS_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    return isBotSettings(parsed) ? parsed : DEFAULT_BOT_SETTINGS;
  } catch {
    return DEFAULT_BOT_SETTINGS;
  }
}

export function writeBotSettings(settings: BotSettings) {
  window.localStorage.setItem(BOT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(BOT_SETTINGS_CHANGE_EVENT));
}

export function botSettingsSnapshot() {
  return JSON.stringify(readBotSettings());
}

export const defaultBotSettingsSnapshot = JSON.stringify(DEFAULT_BOT_SETTINGS);
