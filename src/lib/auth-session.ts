export type DemoSession = {
  email: string;
  initials: string;
};

export const DEMO_SESSION_STORAGE_KEY = "helpwise-demo-session";
export const DEMO_SESSION_CHANGE_EVENT = "helpwise:demo-session-change";

function initialsFor(email: string) {
  const localPart = email.split("@")[0] || "U";
  return localPart.split(/[._-]/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
}

export function readDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    const session: unknown = stored ? JSON.parse(stored) : null;
    if (!session || typeof session !== "object") return null;
    const value = session as DemoSession;
    return typeof value.email === "string" && typeof value.initials === "string" ? value : null;
  } catch {
    return null;
  }
}

export function writeDemoSession(email: string) {
  window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify({ email, initials: initialsFor(email) }));
  window.dispatchEvent(new Event(DEMO_SESSION_CHANGE_EVENT));
}

export function clearDemoSession() {
  void getSupabaseBrowserClient()?.auth.signOut();
  window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(DEMO_SESSION_CHANGE_EVENT));
}

export function demoSessionSnapshot() {
  return JSON.stringify(readDemoSession());
}

export const defaultDemoSessionSnapshot = "null";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
