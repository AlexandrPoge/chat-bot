import type { BotSettings } from "@/lib/bot-settings";
import type { CloudBot } from "./types";
import { accessToken } from "./knowledge-api";

async function request(path: string, init?: RequestInit) {
  const token = await accessToken();
  if (!token) throw new Error("Your session expired. Please log in again.");
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
  });
  const body = await response.json() as { bot?: CloudBot; bots?: CloudBot[]; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Bot request failed.");
  return body;
}

export async function fetchBots() {
  return (await request("/api/bots")).bots ?? [];
}

export async function createBot(name: string) {
  const bot = (await request("/api/bots", { method: "POST", body: JSON.stringify({ name }) })).bot;
  if (!bot) throw new Error("The new bot was not returned.");
  return bot;
}

export async function deleteBot(id: string) {
  await request(`/api/bots?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function updateBot(id: string, settings?: BotSettings, published?: boolean) {
  const bot = (await request("/api/bots", {
    method: "PATCH",
    body: JSON.stringify({ id, ...settings, published }),
  })).bot;
  if (!bot) throw new Error("The updated bot was not returned.");
  return bot;
}
