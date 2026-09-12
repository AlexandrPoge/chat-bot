import { type FormEvent } from "react";
import type { WidgetMode } from "./types";

type Props = {
  botId: string;
  loading: boolean;
  mode: WidgetMode;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export function WidgetComposer({ botId, loading, mode, question, onQuestionChange, onSubmit }: Props) {
  return <form className="shrink-0 border-t border-[#e6ebe3] bg-white p-3" onSubmit={onSubmit}><div className="flex items-center gap-2 rounded-xl border border-[#dce5d8] p-1.5 transition-all duration-200 focus-within:border-[#8bb660] focus-within:shadow-[0_0_0_4px_rgba(139,182,96,.14)]"><input aria-label="Ask a question" className="min-w-0 flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[#a4aca2]" onChange={(event) => onQuestionChange(event.target.value)} placeholder="Ask a question…" value={question} /><button aria-label="Send question" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#d9fb97] text-sm font-bold text-[#405735] transition-all duration-200 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50" disabled={!question.trim() || loading} type="submit">↑</button></div><p className="mt-2 truncate text-center text-[9px] text-[#9ca69b]">{mode === "gemini" ? "Gemini · grounded in your active source" : "Free Test AI · no external API calls"} · bot {botId}</p></form>;
}
