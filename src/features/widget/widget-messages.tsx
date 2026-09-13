import { useEffect, useRef } from "react";
import type { BotSettings } from "@/lib/bot-settings";
import type { KnowledgeSource } from "@/lib/test-assistant";
import type { WidgetMessage } from "./types";

type Props = {
  activeSource?: KnowledgeSource;
  loading: boolean;
  messages: WidgetMessage[];
  settings: BotSettings;
  onPrompt: (prompt: string) => void;
};

function promptExamples(source?: KnowledgeSource) {
  return source?.name.toLowerCase().includes("dental")
    ? ["How do I book an appointment?", "Can you help with a filling?"]
    : ["What can you help me with?", "What are the key details?"];
}

export function WidgetMessages({ activeSource, loading, messages, settings, onPrompt }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages.length, loading]);
  return <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fbfcfa] px-3 py-3 [scrollbar-gutter:stable] sm:p-4" ref={listRef}><div className="space-y-3">{messages.map((message) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}><article className={`max-w-[91%] break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 shadow-sm ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dc] bg-white text-[#536053]"}`}><p>{message.content || settings.welcome}</p>{message.followUp && <p className="mt-1.5 text-[11px] leading-4 text-[#778476]">{message.followUp}</p>}</article></div>)}{messages.length === 1 && !loading && <div className="flex flex-wrap gap-2 pt-0.5">{promptExamples(activeSource).map((prompt) => <button className="rounded-full border border-[#d8e4d2] bg-white px-3 py-2 text-[11px] font-semibold text-[#587748] transition-all duration-200 hover:-translate-y-px hover:border-[#9abd7d] hover:shadow-sm" key={prompt} onClick={() => onPrompt(prompt)} type="button">{prompt}</button>)}</div>}{loading && <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-[#e0e7dc] bg-white px-3.5 py-2.5 text-xs text-[#8b9689]"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7da952]" />{settings.name} is thinking…</div>}</div></div>;
}
