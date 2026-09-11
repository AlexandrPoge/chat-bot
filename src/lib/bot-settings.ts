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

function profileValue(text: string, labels: string[]) {
  const labelPattern = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:${labelPattern})\\s*:\\s*([^\\n\\r.]{2,120})`, "i"));
  return match?.[1]?.trim();
}

export function profileFromSource(text: string): Partial<BotSettings> {
  const name = profileValue(text, ["BOT_NAME", "BOT NAME", "НАЗВАНИЕ БОТА"]);
  const welcome = profileValue(text, ["WELCOME_MESSAGE", "WELCOME MESSAGE", "ПРИВЕТСТВИЕ"]);
  const accent = profileValue(text, ["ACCENT_COLOR", "ACCENT COLOR", "ЦВЕТ БОТА"]);
  const profile: Partial<BotSettings> = {};

  if (name) profile.name = name;
  if (welcome) profile.welcome = welcome;
  if (accent && /^#[0-9A-Fa-f]{6}$/.test(accent)) profile.accent = accent;
  return profile;
}
