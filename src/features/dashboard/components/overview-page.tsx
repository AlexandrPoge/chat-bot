import { useState } from "react";
import { BadgeCheck, ChevronRight, Database, FileText, MessageCircleMore, type LucideIcon } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";
import { BotPreview } from "./bot-preview";
import { ChatPanel } from "./chat-panel";
import { OnboardingChecklist } from "./onboarding-checklist";
import type { ChatMessage, ChatMode, DashboardDocument, DashboardStats, Section } from "../types";

type Props = {
  activeDocument?: DashboardDocument;
  documents: DashboardDocument[];
  settings: BotSettings;
  stats: DashboardStats;
  messages: ChatMessage[];
  isAnswering: boolean;
  userName: string;
  onAsk: (question: string, mode: ChatMode) => void;
  onGoTo: (section: Section) => void;
};

export function OverviewPage(props: Props) {
  const { activeDocument, documents, settings, stats, messages, isAnswering, userName, onAsk, onGoTo } = props;
  const confidence = stats.answers ? Math.round((stats.groundedAnswers / stats.answers) * 100) : 0;
  const metrics: [string, string, string, string, LucideIcon][] = [
    ["Knowledge sources", String(stats.sources), stats.sources ? "Synced in Supabase" : "Add a cloud source", "Every ready source is stored privately and indexed for this bot.", Database],
    ["Answers", String(stats.answers), `${stats.conversations} conversations`, "Live customer and Gemini preview conversations are persisted in Supabase.", MessageCircleMore],
    ["Grounded answers", stats.answers ? `${confidence}%` : "—", stats.answers ? "Measured from sources" : "No live answers yet", "This ratio is calculated from assistant messages linked to a source document.", BadgeCheck],
  ];
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [, value, , detail] = metrics[selectedMetric];
  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Support workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Good morning, {userName}.</h1><p className="mt-2 text-sm text-[#7d877c]">Your support guide is ready for customers.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#354238]" onClick={() => onGoTo("widget")} type="button">Open live widget <ChevronRight size={15} /></button></div>
    {stats.sources === 0 && <OnboardingChecklist onGoTo={onGoTo} />}
    <div className="grid gap-3 sm:grid-cols-3">{metrics.map(([label, metricValue, metricNote, , Icon], index) => <button aria-pressed={selectedMetric === index} className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-lg ${selectedMetric === index ? "border-[#9ec47b] ring-2 ring-[#e3f1d6]" : "border-[#e0e6dc]"}`} key={label} onClick={() => setSelectedMetric(index)} type="button"><div className="flex justify-between"><p className="text-xs text-[#879087]">{label}</p><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef5e8] text-[#6a953e]"><Icon size={15} /></span></div><p className="mt-4 text-2xl font-semibold tracking-[-.05em]">{metricValue || documents.length}</p><p className="mt-1 text-[11px] font-bold text-[#709744]">{metricNote}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf2e9]"><div className="h-full rounded-full bg-[#88b95d]" style={{ width: index === 0 ? "100%" : index === 1 ? "78%" : "93%" }} /></div></button>)}</div>
    <section className="flex flex-col gap-3 rounded-2xl border border-[#dce8d4] bg-[#f3f8ee] p-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#759a4d]">Metric details · {value || `${documents.length} sources`}</p><p className="mt-1 text-sm leading-6 text-[#5d6d59]">{detail}</p></div><button className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#5f8a3d] shadow-sm transition hover:-translate-y-px" onClick={() => onGoTo(selectedMetric === 0 ? "knowledge" : "conversations")} type="button">View details</button></section>
    <div className="grid gap-5 xl:grid-cols-[1.07fr_.93fr]"><ChatPanel activeSourceName={activeDocument?.name ?? "No source selected"} botName={settings.name} isAnswering={isAnswering} messages={messages} onAsk={onAsk} /><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Your bot</h2><p className="mt-1 text-xs text-[#899289]">The assistant customers meet</p></div><button className="text-xs font-bold text-[#6e9442]" onClick={() => onGoTo("settings")} type="button">Configure <ChevronRight className="inline" size={13} /></button></div><div className="mt-6"><BotPreview settings={settings} /></div><button className="mt-5 flex w-full items-center gap-2 border-t border-[#edf0eb] pt-4 text-left text-xs font-bold text-[#5c665c] hover:text-[#4c7b2b]" onClick={() => onGoTo("knowledge")} type="button"><FileText size={14} className="text-[#719a45]" /><span className="truncate">Active: {activeDocument?.name ?? "No source"}</span></button></section></div>
  </div>;
}
