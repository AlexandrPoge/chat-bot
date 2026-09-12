"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { FileText, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import type { ChatMessage, ChatMode } from "../types";

type Props = {
  activeSourceName: string;
  botName: string;
  isAnswering: boolean;
  messages: ChatMessage[];
  onAsk: (question: string, mode: ChatMode) => void;
};

export function ChatPanel({ activeSourceName, botName, isAnswering, messages, onAsk }: Props) {
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<ChatMode>("test");
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages.length, isAnswering]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || isAnswering) return;
    onAsk(draft.trim(), mode);
    setDraft("");
  };
  return (
    <section className="flex h-[min(620px,calc(100dvh-10rem))] min-h-[410px] flex-col overflow-hidden rounded-[1.25rem] border border-[#dfe7da] bg-white shadow-[0_22px_45px_-38px_rgba(32,45,31,.78)]">
      <header className="shrink-0 border-b border-[#e7ebe4] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#edf7e6] text-[#5d9236]"><ShieldCheck size={14} /></span><h2 className="font-semibold tracking-[-.03em]">Customer-ready preview</h2></div><p className="mt-1 flex truncate text-xs text-[#71806e]"><FileText size={12} className="mr-1.5 shrink-0 text-[#6d9b40]" />Active source: {activeSourceName}</p></div><div className="flex w-fit rounded-lg bg-[#f1f5ee] p-1 text-[11px] font-bold"><button aria-pressed={mode === "test"} className={`rounded-md px-2.5 py-1.5 transition-all ${mode === "test" ? "bg-white text-[#4d7432] shadow-sm" : "text-[#899387]"}`} onClick={() => setMode("test")} type="button">✦ Test AI</button><button aria-pressed={mode === "live"} className={`rounded-md px-2.5 py-1.5 transition-all ${mode === "live" ? "bg-white text-[#4d7432] shadow-sm" : "text-[#899387]"}`} onClick={() => setMode("live")} type="button">Gemini AI</button></div></div>
      </header>
      <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-3.5 [scrollbar-gutter:stable] sm:p-5" ref={listRef}><div className="space-y-3.5">{messages.map((message) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}><article className={`max-w-[92%] break-words rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm sm:max-w-[84%] sm:px-4 ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dd] bg-white text-[#4d584d]"}`}><p>{message.content}</p>{message.source && <p className="mt-2 flex items-center gap-1.5 border-t border-[#e4ecdf] pt-2 text-[11px] font-bold text-[#668f3d]"><FileText size={12} />{message.source}</p>}{message.followUp && <p className="mt-2 text-xs leading-5 text-[#6f7c6f]">{message.followUp}</p>}</article></div>)}{isAnswering && <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-[#e1e7dd] bg-white px-4 py-3 text-sm text-[#839083]"><LoaderCircle className="animate-spin" size={15} />{botName} is thinking…</div>}</div></div>
      <form className="m-3 flex shrink-0 gap-2 rounded-xl border border-[#dce4d8] bg-white p-1.5 shadow-sm transition focus-within:border-[#8bb660] sm:m-4" onSubmit={submit}><input aria-label="Ask your bot a question" className="min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-[#9ca69a]" onChange={(event) => setDraft(event.target.value)} placeholder="Ask a customer question…" value={draft} /><button aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#d9fb97] text-[#33422e] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50" disabled={!draft.trim() || isAnswering} type="submit"><Send size={16} strokeWidth={2.6} /></button></form>
      <p className="-mt-1 mb-3 shrink-0 px-4 text-center text-[10px] text-[#8d978b] sm:mb-4">{mode === "test" ? "Free Test AI · answers stay grounded in the active source" : "Gemini answers from the active source · key stays server-side"}</p>
    </section>
  );
}
