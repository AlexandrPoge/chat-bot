export type BotSettings = {
  name: string;
  welcome: string;
  accent: string;
};

export const DEFAULT_BOT_SETTINGS: BotSettings = {
  name: "Orbit support",
  welcome: "Hi! I’m Orbit. Ask me anything about the product, account, or billing.",
  accent: "#D9FB97",
};

const PROFILE_LABELS = ["BOT_NAME", "BOT NAME", "НАЗВАНИЕ БОТА", "WELCOME_MESSAGE", "WELCOME MESSAGE", "ПРИВЕТСТВИЕ", "ACCENT_COLOR", "ACCENT COLOR", "ЦВЕТ БОТА"];

function profileValue(text: string, labels: string[]) {
  const labelPattern = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const nextLabel = PROFILE_LABELS.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:${labelPattern})\\s*:\\s*([^\\n\\r]{2,120}?)(?=\\s+(?:${nextLabel})\\s*:|[.\\n\\r]|$)`, "i"));
  return match?.[1]?.trim();
}

export function profileFromSource(text: string): Partial<BotSettings> {
  const name = profileValue(text, ["BOT_NAME", "BOT NAME", "НАЗВАНИЕ БОТА"]);
  const welcome = profileValue(text, ["WELCOME_MESSAGE", "WELCOME MESSAGE", "ПРИВЕТСТВИЕ"]);
  const accent = text.match(/(?:ACCENT_COLOR|ACCENT COLOR|ЦВЕТ БОТА)\s*:\s*(#[0-9a-f]{6})/i)?.[1];
  const profile: Partial<BotSettings> = {};

  if (name) profile.name = name;
  if (welcome) profile.welcome = welcome;
  if (accent && /^#[0-9A-Fa-f]{6}$/.test(accent)) profile.accent = accent;
  return profile;
}

function titleFromFileName(fileName: string) {
  const decoded = fileName.replace(/\.[^.]+$/, "");
  const words = decoded.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const titled = words.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  return titled.slice(0, 64) || "Support assistant";
}

function welcomeFor(name: string) {
  return /[а-яё]/i.test(name)
    ? `Привет! Я ${name}. Спросите меня о содержании этого документа.`
    : `Hi! I’m ${name}. Ask me anything covered in this document.`;
}

export function profileFromDocument(fileName: string, text: string): Partial<BotSettings> {
  const explicit = profileFromSource(text);
  const name = explicit.name ?? titleFromFileName(fileName);
  return { ...explicit, name, welcome: explicit.welcome ?? welcomeFor(name) };
}
