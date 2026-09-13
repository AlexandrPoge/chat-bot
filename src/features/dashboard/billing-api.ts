import { accessToken } from "./knowledge-api";
import type { Plan } from "./types";

export async function recordTestPayment(botId: string, plan: Plan) {
  const token = await accessToken();
  if (!token) throw new Error("Your session expired. Please log in again.");
  const response = await fetch("/api/billing", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ botId, plan }),
  });
  const body = await response.json() as { error?: string; recorded?: boolean; warning?: string };
  if (!response.ok) throw new Error(body.error ?? "Test payment could not be recorded.");
  return body;
}
