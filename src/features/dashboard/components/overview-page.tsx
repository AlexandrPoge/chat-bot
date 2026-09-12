import { BadgeCheck, ChevronRight, Database, FileText, MessageCircleMore, type LucideIcon } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";
import { BotPreview } from "./bot-preview";
import { ChatPanel } from "./chat-panel";
import type { ChatMessage, ChatMode, DashboardDocument, Section } from "../types";

type Props = {
  activeDocument?: DashboardDocument;
  documents: DashboardDocument[];
  settings: BotSettings;
  messages: ChatMessage[];
  isAnswering: boolean;
  userName: string;
  onAsk: (question: string, mode: ChatMode) => void;
  onGoTo: (section: Section) => void;
};

const metrics: [string, string, string, LucideIcon][] = [
  ["Knowledge sources", "", "All indexed", Database],
  ["Answers this month", "438", "↑ 18% vs. Aug", MessageCircleMore],
  ["Source confidence", "93%", "Healthy", BadgeCheck],
];

export function OverviewPage(props: Props) {
  const { activeDocument, documents, settings, messages, isAnswering, userName, onAsk, onGoTo } = props;
  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Support workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Good morning, {userName}.</h1><p className="mt-2 text-sm text-[#7d877c]">Your support guide is ready for customers.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#354238]" onClick={() => onGoTo("widget")} type="button">Open live widget <ChevronRight size={15} /></button></div>
    <div className="grid gap-3 sm:grid-cols-3">{metrics.map(([label, value, note, Icon]) => <article className="rounded-2xl border border-[#e0e6dc] bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg" key={label}><div className="flex justify-between"><p className="text-xs text-[#879087]">{label}</p><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef5e8] text-[#6a953e]"><Icon size={15} /></span></div><p className="mt-4 text-2xl font-semibold tracking-[-.05em]">{value || documents.length}</p><p className="mt-1 text-[11px] font-bold text-[#709744]">{note}</p></article>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.07fr_.93fr]"><ChatPanel activeSourceName={activeDocument?.name ?? "No source selected"} botName={settings.name} isAnswering={isAnswering} messages={messages} onAsk={onAsk} /><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Your bot</h2><p className="mt-1 text-xs text-[#899289]">The assistant customers meet</p></div><button className="text-xs font-bold text-[#6e9442]" onClick={() => onGoTo("settings")} type="button">Configure <ChevronRight className="inline" size={13} /></button></div><div className="mt-6"><BotPreview settings={settings} /></div><button className="mt-5 flex w-full items-center gap-2 border-t border-[#edf0eb] pt-4 text-left text-xs font-bold text-[#5c665c] hover:text-[#4c7b2b]" onClick={() => onGoTo("knowledge")} type="button"><FileText size={14} className="text-[#719a45]" /><span className="truncate">Active: {activeDocument?.name ?? "No source"}</span></button></section></div>
  </div>;
}
