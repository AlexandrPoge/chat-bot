"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  BOT_SETTINGS_CHANGE_EVENT,
  BOT_SETTINGS_STORAGE_KEY,
  botSettingsSnapshot,
  defaultBotSettingsSnapshot,
  type BotSettings,
} from "@/lib/bot-settings";
import { getTestAnswer } from "@/lib/test-assistant";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
  followUp?: string;
};

const demoSources = [
  { name: "Team collaboration guide.pdf", summary: "Project guests can view deliverables and comment. Owners invite guests from the Share menu." },
  { name: "Billing & plans.md", summary: "Pro includes custom colors, domain allowlists, unlimited sources, and no Helpwise branding." },
  { name: "Product onboarding.docx", summary: "New accounts create a workspace, connect a product, and invite teammates during onboarding." },
];

function subscribeToSavedSettings(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOT_SETTINGS_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOT_SETTINGS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOT_SETTINGS_CHANGE_EVENT, onStoreChange);
  };
}

function useSavedSettings() {
  const snapshot = useSyncExternalStore(subscribeToSavedSettings, botSettingsSnapshot, () => defaultBotSettingsSnapshot);
  return JSON.parse(snapshot) as BotSettings;
}

export default function WidgetClient({ botId }: { botId: string }) {
  const settings = useSavedSettings();
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", content: "" }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;

    setMessages((items) => [...items, { id: Date.now(), role: "user", content: value }]);
    setQuestion("");
    setLoading(true);

    window.setTimeout(() => {
      const answer = getTestAnswer(value, demoSources, messages.length);
      setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answer }]);
      setLoading(false);
    }, 420);
  };

  return (
    <main className="flex min-h-screen items-end bg-transparent p-0 text-[#303a30]">
      <section className="flex h-[440px] w-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-[#dce5d8] bg-white shadow-[0_18px_55px_rgba(24,40,28,.18)] sm:h-[470px]">
        <header className="flex shrink-0 items-center gap-3 bg-[#202823] px-4 py-3.5 text-white">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl transition-transform duration-300 hover:scale-110" style={{ backgroundColor: settings.accent }}><Image alt={`${settings.name} mascot`} className="scale-[1.7] object-contain" height={36} priority src="/mascot/orbit-support-mascot.png" width={36} /></span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{settings.name}</p><p className="mt-0.5 text-[11px] text-[#b9c4b8]">Usually replies instantly</p></div>
          <span className="ml-auto shrink-0 rounded-full bg-[#d9fb97]/15 px-2 py-1 text-[10px] font-semibold text-[#d9fb97]">Test AI · free</span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfcfa] p-4" ref={messageListRef}>
          <div className="space-y-3">
            {messages.map((message) => (
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 shadow-sm ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dc] bg-white text-[#536053]"}`}>
                  {message.id === 1 ? settings.welcome : message.content}
                  {message.source && <p className="mt-2 border-t border-[#e5eddf] pt-2 text-[10px] font-semibold text-[#709746]">↗ {message.source}</p>}
                  {message.followUp && <p className="mt-2 text-[11px] text-[#778476]">{message.followUp}</p>}
                </div>
              </div>
            ))}
            {loading && <div className="w-fit rounded-2xl rounded-tl-md border border-[#e0e7dc] bg-white px-3.5 py-2.5 text-xs text-[#8b9689]">{settings.name} is thinking…</div>}
          </div>
        </div>
        <form className="shrink-0 border-t border-[#e6ebe3] bg-white p-3" onSubmit={sendMessage}>
          <div className="flex items-center gap-2 rounded-xl border border-[#dce5d8] p-1.5 transition-shadow duration-200 focus-within:border-[#8bb660] focus-within:shadow-[0_0_0_4px_rgba(139,182,96,.14)]">
            <input aria-label={`Ask ${settings.name} a question`} className="min-w-0 flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[#a4aca2]" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" value={question} />
            <button aria-label="Send question" className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-[#405735] transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:hover:scale-100" disabled={!question.trim() || loading} style={{ backgroundColor: settings.accent }} type="submit">↑</button>
          </div>
          <p className="mt-2 text-center text-[9px] text-[#a2aba0]">Unlimited Test AI · no external API calls · bot {botId}</p>
        </form>
      </section>
    </main>
  );
}
