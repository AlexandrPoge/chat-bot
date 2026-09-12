"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  BOT_SETTINGS_CHANGE_EVENT, BOT_SETTINGS_STORAGE_KEY,
  botSettingsSnapshot, defaultBotSettingsSnapshot, type BotSettings,
} from "@/lib/bot-settings";
import {
  KNOWLEDGE_CHANGE_EVENT, KNOWLEDGE_STORAGE_KEY,
  defaultKnowledgeSnapshot, knowledgeSnapshot, type KnowledgeSnapshot,
} from "@/lib/knowledge-store";
import { getTestAnswer } from "@/lib/test-assistant";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
  followUp?: string;
};

function subscribe(key: string, eventName: string, onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => { if (event.key === key) onStoreChange(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, onStoreChange);
  };
}

function useSavedSettings() {
  const snapshot = useSyncExternalStore((callback) => subscribe(BOT_SETTINGS_STORAGE_KEY, BOT_SETTINGS_CHANGE_EVENT, callback), botSettingsSnapshot, () => defaultBotSettingsSnapshot);
  return JSON.parse(snapshot) as BotSettings;
}

function useSavedKnowledge() {
  const snapshot = useSyncExternalStore((callback) => subscribe(KNOWLEDGE_STORAGE_KEY, KNOWLEDGE_CHANGE_EVENT, callback), knowledgeSnapshot, () => defaultKnowledgeSnapshot);
  return JSON.parse(snapshot) as KnowledgeSnapshot;
}

export default function WidgetClient({ botId }: { botId: string }) {
  const settings = useSavedSettings();
  const knowledge = useSavedKnowledge();
  const activeSource = knowledge.sources.find((source) => source.id === knowledge.activeSourceId) ?? knowledge.sources[0];
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", content: "" }]);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"gemini" | "test">("gemini");
  const [loading, setLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const previousSource = useRef<number | null>(null);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  useEffect(() => {
    if (previousSource.current !== null && previousSource.current !== activeSource?.id) {
      setMessages([{ id: Date.now(), role: "assistant", content: `I’m now using “${activeSource?.name ?? "your active source"}”. What can I help with?`, source: activeSource?.name }]);
    }
    previousSource.current = activeSource?.id ?? null;
  }, [activeSource?.id, activeSource?.name]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;

    setMessages((items) => [...items, { id: Date.now(), role: "user", content: value }]);
    setQuestion("");
    setLoading(true);

    if (mode === "gemini") {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: value, sources: activeSource ? [activeSource] : [] }),
        });
        const body = await response.json() as { answer?: string; source?: string };
        if (response.ok && body.answer?.trim()) {
          setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", content: body.answer ?? "", source: body.source ?? activeSource?.name }]);
          setLoading(false);
          return;
        }
      } catch {
        // A local source-grounded answer is safer than leaving the visitor without a reply.
      }
    }
    window.setTimeout(() => {
      const answer = getTestAnswer(value, activeSource ? [activeSource] : [], messages.length);
      setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answer }]);
      setLoading(false);
    }, 360);
  };

  const prompts = activeSource?.name.toLowerCase().includes("dental")
    ? ["How do I book an appointment?", "Can you help with a filling?"]
    : ["How do I get started?", "What plan should I choose?"];

  return (
    <main className="h-dvh min-h-0 w-full overflow-hidden bg-transparent p-0 text-[#303a30]">
      <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[22px] border border-[#dce5d8] bg-white shadow-[0_18px_55px_rgba(24,40,28,.18)]">
        <header className="flex shrink-0 items-center gap-3 bg-[#202823] px-3.5 py-3 text-white sm:px-4 sm:py-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl transition-transform duration-300 hover:scale-105" style={{ backgroundColor: settings.accent }}><Image alt={`${settings.name} mascot`} className="scale-[1.7] object-contain" height={40} priority src="/mascot/orbit-support-mascot.png" width={40} /></span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{settings.name}</p><p className="mt-0.5 truncate text-[11px] text-[#b9c4b8]">Answers from your selected source</p></div>
          <div className="ml-auto flex shrink-0 rounded-lg bg-white/10 p-0.5 text-[9px] font-bold"><button aria-pressed={mode === "test"} className={`rounded-md px-1.5 py-1 transition ${mode === "test" ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`} onClick={() => setMode("test")} type="button">Test</button><button aria-pressed={mode === "gemini"} className={`rounded-md px-1.5 py-1 transition ${mode === "gemini" ? "bg-[#d9fb97] text-[#405735]" : "text-white/55 hover:text-white"}`} onClick={() => setMode("gemini")} type="button">Gemini</button></div>
        </header>
        <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fbfcfa] px-3 py-3.5 [scrollbar-gutter:stable] sm:p-4" ref={messageListRef}>
          <div className="space-y-3">
            {messages.map((message) => (
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}>
                <article className={`max-w-[91%] break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 shadow-sm ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dc] bg-white text-[#536053]"}`}>
                  <p>{message.content || settings.welcome}</p>
                  {message.source && <p className="mt-2 flex items-center gap-1.5 border-t border-[#e5eddf] pt-2 text-[10px] font-semibold text-[#709746]">↗ {message.source}</p>}
                  {message.followUp && <p className="mt-1.5 text-[11px] leading-4 text-[#778476]">{message.followUp}</p>}
                </article>
              </div>
            ))}
            {messages.length === 1 && !loading && <div className="flex flex-wrap gap-2 pt-0.5">{prompts.map((prompt) => <button className="rounded-full border border-[#d8e4d2] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#587748] transition-all duration-200 hover:-translate-y-px hover:border-[#9abd7d] hover:shadow-sm" key={prompt} onClick={() => setQuestion(prompt)} type="button">{prompt}</button>)}</div>}
            {loading && <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-[#e0e7dc] bg-white px-3.5 py-2.5 text-xs text-[#8b9689]"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7da952]" />{settings.name} is thinking…</div>}
          </div>
        </div>
        <form className="shrink-0 border-t border-[#e6ebe3] bg-white p-3" onSubmit={sendMessage}>
          <div className="flex items-center gap-2 rounded-xl border border-[#dce5d8] p-1.5 transition-all duration-200 focus-within:border-[#8bb660] focus-within:shadow-[0_0_0_4px_rgba(139,182,96,.14)]">
            <input aria-label={`Ask ${settings.name} a question`} className="min-w-0 flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[#a4aca2]" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" value={question} />
            <button aria-label="Send question" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-[#405735] transition-all duration-200 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100" disabled={!question.trim() || loading} style={{ backgroundColor: settings.accent }} type="submit">↑</button>
          </div>
          <p className="mt-2 truncate text-center text-[9px] text-[#9ca69b]">{mode === "gemini" ? "Gemini · grounded in your active source" : "Free Test AI · no external API calls"} · bot {botId}</p>
        </form>
      </section>
    </main>
  );
}
