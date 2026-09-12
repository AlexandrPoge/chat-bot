import { type FormEvent } from "react";

type Props = {
  loading: boolean;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export function WidgetComposer({ loading, question, onQuestionChange, onSubmit }: Props) {
  return <form className="shrink-0 border-t border-[#e6ebe3] bg-white p-2.5 pb-[max(10px,env(safe-area-inset-bottom))] sm:p-3" onSubmit={onSubmit}><div className="flex items-center gap-2 rounded-xl border border-[#dce5d8] p-1.5 transition-all duration-200 focus-within:border-[#8bb660] focus-within:shadow-[0_0_0_4px_rgba(139,182,96,.14)]"><input aria-label="Ask a question" className="min-w-0 flex-1 bg-transparent px-2 text-[16px] outline-none placeholder:text-[#a4aca2] sm:text-[13px]" onChange={(event) => onQuestionChange(event.target.value)} placeholder="Ask a question…" value={question} /><button aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#d9fb97] text-sm font-bold text-[#405735] transition-all duration-200 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9" disabled={!question.trim() || loading} type="submit">↑</button></div></form>;
}
