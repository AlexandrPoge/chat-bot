import { BarChart3, MessageCircleMore, Sparkles } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";
import { ChatPanel } from "./chat-panel";
import type { ChatMessage, ChatMode, DashboardDocument } from "../types";

type Props = {
  activeDocument?: DashboardDocument;
  isAnswering: boolean;
  messages: ChatMessage[];
  settings: BotSettings;
  onAsk: (question: string, mode: ChatMode) => void;
};

export function ConversationsPage({ activeDocument, isAnswering, messages, settings, onAsk }: Props) {
  const answers = messages.slice(1).filter((message) => message.role === "assistant");
  const grounded = answers.filter((message) => message.source).length;
  const health = answers.length ? Math.round((grounded / answers.length) * 100) : 0;
  return <div className="space-y-5"><div><p className="text-sm font-medium text-[#73806e]">Test before customers do</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Conversations</h1><p className="mt-2 text-sm text-[#7d877c]">Ask as a customer and compare the free Test AI with live Gemini answers.</p></div>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.6fr]"><ChatPanel activeSourceName={activeDocument?.name ?? "No source selected"} botName={settings.name} isAnswering={isAnswering} messages={messages} onAsk={onAsk} /><aside className="space-y-4"><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center gap-2 text-[#5d8839]"><BarChart3 size={17} /><p className="text-sm font-bold">Conversation health</p></div><p className="mt-5 text-3xl font-semibold tracking-[-.05em]">{answers.length ? `${health}%` : "—"}</p><p className="mt-1 text-xs font-bold text-[#709744]">{answers.length ? "Answers supported by a source" : "Ask a question to measure"}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf2e9]"><div className="h-full rounded-full bg-[#85b757] transition-[width]" style={{ width: `${health}%` }} /></div><p className="mt-4 text-xs leading-5 text-[#738072]">This preview always uses <b>{activeDocument?.name ?? "the selected source"}</b>. Change it in Knowledge when testing another scenario.</p></section><section className="rounded-2xl bg-[#202823] p-5 text-white"><Sparkles className="text-[#d9fb97]" size={17} /><h2 className="mt-4 font-semibold">Try a realistic question</h2><p className="mt-2 text-xs leading-5 text-[#b6c1b5]">Ask in the language your customer uses. Gemini answers only from the selected source; Test AI remains free.</p><div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#d9fb97]"><MessageCircleMore size={14} />{messages.length - 1} messages in this test</div></section></aside></div>
  </div>;
}
