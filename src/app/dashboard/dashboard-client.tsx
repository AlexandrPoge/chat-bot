"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Clipboard,
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  MessageCircleMore,
  ReceiptText,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  BOT_SETTINGS_CHANGE_EVENT,
  BOT_SETTINGS_STORAGE_KEY,
  botSettingsSnapshot,
  defaultBotSettingsSnapshot,
  type BotSettings,
  writeBotSettings,
} from "@/lib/bot-settings";
import { extractFileSummary } from "@/lib/extract-file-text";
import { getTestAnswer, type KnowledgeSource } from "@/lib/test-assistant";

type Section = "overview" | "knowledge" | "conversations" | "widget" | "settings";
type Plan = "Starter" | "Pro";
type ChatMode = "test" | "live";

type Document = KnowledgeSource & {
  id: number;
  type: "PDF" | "DOCX" | "TXT" | "MD";
  size: string;
  status: "Ready" | "Indexing";
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
  followUp?: string;
};

const startingDocuments: Document[] = [
  { id: 1, name: "Team collaboration guide.pdf", type: "PDF", size: "2.4 MB", status: "Ready", summary: "Project guests can view deliverables and comment. Owners invite guests from the Share menu." },
  { id: 2, name: "Billing & plans.md", type: "MD", size: "18 KB", status: "Ready", summary: "Pro includes custom colors, domain allowlists, unlimited sources, and no Helpwise branding." },
  { id: 3, name: "Product onboarding.docx", type: "DOCX", size: "1.1 MB", status: "Ready", summary: "New accounts create a workspace, connect a product, and invite teammates during onboarding." },
];

const navigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "conversations", label: "Conversations", icon: MessageCircleMore },
  { id: "widget", label: "Widget", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings2 },
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

function StatusPill({ status }: { status: Document["status"] }) {
  const ready = status === "Ready";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${ready ? "bg-[#edf8e5] text-[#609437]" : "bg-[#fff6de] text-[#9f6d1f]"}`}><span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-[#77b346]" : "bg-[#e2a13a]"}`} />{status}</span>;
}

function BotPreview({ settings, className = "" }: { settings: BotSettings; className?: string }) {
  return <div className={`rounded-[1.25rem] border border-[#dde5da] bg-white p-4 shadow-[0_18px_34px_-26px_rgba(33,50,31,.45)] ${className}`}>
    <div className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl transition-transform duration-300 hover:scale-110" style={{ backgroundColor: settings.accent }}><Image alt="Orbit support mascot" className="scale-[1.65] object-contain" height={40} priority src="/mascot/orbit-support-mascot.png" width={40} /></span>
      <div><p className="text-xs font-bold text-[#354135]">{settings.name}</p><p className="mt-0.5 text-[10px] text-[#8c9689]">Usually replies instantly</p></div>
      <span className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-[#f5f7f3] text-[#9aa49a]">×</span>
    </div>
    <div className="mt-5 rounded-xl bg-[#f3f6ef] p-3 text-xs leading-5 text-[#586458]">{settings.welcome}</div>
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e1e7de] px-3 py-2.5 text-[11px] text-[#a3aba1]">Ask a question…<span className="ml-auto grid h-5 w-5 place-items-center rounded-md text-[#405535] transition-transform duration-200 group-hover:translate-x-0.5" style={{ backgroundColor: settings.accent }}><Send size={11} /></span></div>
    <p className="mt-3 text-center text-[9px] font-medium text-[#a4ada2]">Powered by Helpwise</p>
  </div>;
}

function ChatPanel({ botName, messages, isAnswering, onAsk }: { botName: string; messages: Message[]; isAnswering: boolean; onAsk: (question: string, mode: ChatMode) => void }) {
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<ChatMode>("test");
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages.length, isAnswering]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || isAnswering) return;
    onAsk(question, mode);
    setDraft("");
  };

  return <section className="flex h-[440px] min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0e6dc] bg-white shadow-[0_18px_40px_-38px_rgba(32,45,31,.6)] sm:h-[470px]">
    <div className="shrink-0 border-b border-[#e7ebe4] px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold tracking-[-0.03em]">Test your bot</h2><p className="mt-0.5 text-xs text-[#8d968c]">Messages stay inside this chat and scroll automatically.</p></div><div className="flex rounded-lg bg-[#f1f5ee] p-1 text-[11px] font-bold"><button aria-pressed={mode === "test"} className={`rounded-md px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-px ${mode === "test" ? "bg-white text-[#4d7432] shadow-sm" : "text-[#899387] hover:bg-white/60"}`} onClick={() => setMode("test")} type="button">✦ Test AI · free</button><button aria-pressed={mode === "live"} className={`rounded-md px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-px ${mode === "live" ? "bg-white text-[#4d7432] shadow-sm" : "text-[#899387] hover:bg-white/60"}`} onClick={() => setMode("live")} type="button">Live API</button></div></div>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfcfa] p-4 sm:p-5" ref={messageListRef}>
      <div className="space-y-4">
        {messages.map((message) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}><div className={`max-w-[87%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dd] bg-white text-[#4d584d]"}`}><p>{message.content}</p>{message.source && <p className="mt-2 flex items-center gap-1.5 border-t border-[#e4ecdf] pt-2 text-[11px] font-bold text-[#668f3d]"><FileText size={12} />{message.source}</p>}{message.followUp && <p className="mt-2 text-xs text-[#6f7c6f]">{message.followUp}</p>}</div></div>)}
        {isAnswering && <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-[#e1e7dd] bg-white px-4 py-3 text-sm text-[#839083]"><LoaderCircle className="animate-spin" size={15} />{botName} is thinking…</div>}
      </div>
    </div>
    <form className="m-3 flex shrink-0 gap-2 rounded-xl border border-[#dce4d8] bg-white p-2 shadow-sm transition-shadow duration-200 focus-within:border-[#8bb660] focus-within:shadow-[0_0_0_4px_rgba(139,182,96,.14)] sm:m-4" onSubmit={submit}><input aria-label="Ask your bot a question" className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[#a4aca2]" onChange={(event) => setDraft(event.target.value)} placeholder="Ask about your product…" value={draft} /><button aria-label="Send question" className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9fb97] text-[#33422e] transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:hover:scale-100" disabled={!draft.trim() || isAnswering} type="submit"><Send size={15} strokeWidth={2.6} /></button></form>
    <p className="-mt-1 mb-3 shrink-0 px-4 text-[10px] text-[#8d978b] sm:mb-4 sm:px-5">{mode === "test" ? "Unlimited Test AI: local, free, and never calls an external API." : "Live API uses your server-side OpenAI key if configured."}</p>
  </section>;
}

function TestCheckout({ onClose, onPaid }: { onClose: () => void; onPaid: () => void }) {
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const formatCard = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const pay = (event: FormEvent) => {
    event.preventDefault();
    if (card.replace(/\s/g, "") !== "4242424242424242" || expiry.length < 4 || cvc.length < 3 || !name.trim()) {
      setError("Use test card 4242 4242 4242 4242, any future date, and any 3-digit CVC.");
      return;
    }
    setError("");
    setProcessing(true);
    window.setTimeout(onPaid, 850);
  };

  return <div className="fixed inset-0 z-40 grid place-items-center bg-[#172018]/55 p-4 backdrop-blur-sm"><section aria-modal="true" className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[1.5rem] bg-white p-5 shadow-2xl sm:p-6" role="dialog"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#729644]">Secure test checkout</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">One calm step to Pro</h2><p className="mt-2 text-sm leading-6 text-[#758075]">A beautiful test payment flow — no card is stored and no money moves.</p></div><button aria-label="Close checkout" className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f4ef] text-[#7f897e] transition hover:rotate-90 hover:bg-[#e7eee3]" onClick={onClose} type="button"><X size={16} /></button></div><div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#243129,#436143_55%,#91bf65)] p-5 text-white shadow-lg"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-white/65"><span>Helpwise Pro</span><Sparkles size={16} className="text-[#d9fb97]" /></div><p className="mt-8 font-mono text-lg tracking-[.18em]">4242 4242 4242 4242</p><div className="mt-6 flex justify-between text-xs"><span>{name || "YOUR NAME"}</span><span>$39 / month</span></div></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f2f7ed] p-3 text-xs text-[#62745c]"><ShieldCheck size={16} className="shrink-0 text-[#6c9d40]" />Stripe-style sandbox: this checkout is safe to demo.</div><form className="mt-5 space-y-3" onSubmit={pay}><label className="block text-xs font-bold text-[#596559]">Cardholder name<input className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3 py-2.5 text-sm outline-none transition focus:border-[#86ab5a] focus:ring-4 focus:ring-[#dff0cc]" onChange={(event) => setName(event.target.value)} placeholder="Alex Poge" value={name} /></label><label className="block text-xs font-bold text-[#596559]">Card number<div className="relative mt-1.5"><CreditCard className="absolute left-3 top-3 text-[#92a18d]" size={16} /><input className="w-full rounded-xl border border-[#dce4d8] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#86ab5a] focus:ring-4 focus:ring-[#dff0cc]" inputMode="numeric" onChange={(event) => setCard(formatCard(event.target.value))} placeholder="4242 4242 4242 4242" value={card} /></div></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[#596559]">Expiry<input className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3 py-2.5 text-sm outline-none transition focus:border-[#86ab5a] focus:ring-4 focus:ring-[#dff0cc]" onChange={(event) => setExpiry(event.target.value.slice(0, 5))} placeholder="12/30" value={expiry} /></label><label className="block text-xs font-bold text-[#596559]">CVC<input className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3 py-2.5 text-sm outline-none transition focus:border-[#86ab5a] focus:ring-4 focus:ring-[#dff0cc]" inputMode="numeric" onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" value={cvc} /></label></div>{error && <p className="rounded-lg bg-[#fff1ef] px-3 py-2 text-xs leading-5 text-[#b2554a]">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#354238] hover:shadow-lg disabled:opacity-60" disabled={processing} type="submit">{processing ? <><LoaderCircle className="animate-spin" size={15} />Processing test payment</> : <>Activate Pro in test mode <ChevronRight size={15} /></>}</button></form><p className="mt-4 text-center text-[10px] text-[#9ba39a]">Test card: 4242 4242 4242 4242 · any future date · any CVC</p></section></div>;
}

function SettingsEditor({ settings, plan, documentCount, onSave, onUpgrade }: { settings: BotSettings; plan: Plan; documentCount: number; onSave: (settings: BotSettings) => void; onUpgrade: () => void }) {
  const [draft, setDraft] = useState(settings);
  const colors = ["#D9FB97", "#B8D8FF", "#F7CF9C", "#E9C8FF"];

  return <div><p className="text-sm font-medium text-[#73806e]">Make Orbit yours</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Bot settings</h1><p className="mt-2 text-sm text-[#7d877c]">Save once — your embedded widget receives the same name, greeting, and color.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="space-y-5 rounded-2xl border border-[#e0e6dc] bg-white p-5"><label className="block text-sm font-bold text-[#4a554b]">Bot name<input className="mt-2 w-full rounded-xl border border-[#dce3d8] px-3 py-2.5 text-sm outline-none transition focus:border-[#92ae70] focus:ring-4 focus:ring-[#dff0cc]" onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} value={draft.name} /></label><label className="block text-sm font-bold text-[#4a554b]">Welcome message<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#dce3d8] px-3 py-2.5 text-sm font-normal leading-6 outline-none transition focus:border-[#92ae70] focus:ring-4 focus:ring-[#dff0cc]" onChange={(event) => setDraft((value) => ({ ...value, welcome: event.target.value }))} value={draft.welcome} /></label><div><p className="text-sm font-bold text-[#4a554b]">Accent color</p><div className="mt-3 flex flex-wrap gap-3">{colors.map((color) => <button aria-label={`Set ${color} as accent color`} aria-pressed={draft.accent === color} className={`relative grid h-11 w-11 place-items-center rounded-full ring-offset-2 transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4d7136] ${draft.accent === color ? "ring-2 ring-[#4d7136]" : ""}`} key={color} onClick={() => setDraft((value) => ({ ...value, accent: color }))} style={{ backgroundColor: color }} type="button">{draft.accent === color && <Check size={18} className="text-[#2e4227]" strokeWidth={3} />}</button>)}</div><p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#658c3b]"><span className="h-3 w-3 rounded-full border border-[#ced8c6]" style={{ backgroundColor: draft.accent }} />Selected: {draft.accent}</p></div><button className="inline-flex items-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#354238] hover:shadow-lg" onClick={() => onSave(draft)} type="button"><BadgeCheck size={16} />Save & update widget</button></section><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-[-.03em]">Saved preview</h2><p className="mt-1 text-xs text-[#899289]">Exactly what the widget will use</p></div><span className="rounded-full bg-[#edf8e5] px-2.5 py-1 text-[10px] font-bold text-[#5d9035]">Synced</span></div><div className="mt-5"><BotPreview settings={settings} /></div><div className="mt-5 rounded-xl bg-[#f4f8f0] p-4"><p className="text-xs font-bold text-[#637762]">Plan & usage</p><p className="mt-2 text-sm text-[#758075]">You are on <b>{plan}</b>. {documentCount} of {plan === "Starter" ? "20" : "unlimited"} knowledge sources used.</p>{plan === "Starter" && <button className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#69913d] transition hover:translate-x-0.5 hover:text-[#456c25]" onClick={onUpgrade} type="button">Unlock Pro features <ChevronRight size={13} /></button>}</div></section></div></div>;
}

export default function DashboardClient() {
  const [active, setActive] = useState<Section>("overview");
  const [documents, setDocuments] = useState<Document[]>(startingDocuments);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", content: "Hi Alex — I’m ready to help. Ask a real customer question and I’ll keep the answer natural and useful.", source: "Helpwise Test AI" }]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [plan, setPlan] = useState<Plan>("Starter");
  const [planChoice, setPlanChoice] = useState<Plan>("Pro");
  const [billingStep, setBillingStep] = useState<"plans" | "checkout" | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const contentScrollRef = useRef<HTMLElement>(null);
  const settings = useSavedSettings();
  const widgetOrigin = typeof window === "undefined" ? "https://app.helpwise.ai" : window.location.origin;
  const sourceData = documents.map(({ name, summary }) => ({ name, summary }));

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const goTo = (section: Section) => {
    setActive(section);
    window.requestAnimationFrame(() => contentScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const additions = await Promise.all(files.map(async (file, index): Promise<Document> => {
      const extension = file.name.split(".").pop()?.toUpperCase();
      const type = extension === "PDF" || extension === "DOCX" || extension === "TXT" ? extension : "MD";
      let summary: string;
      try { summary = await extractFileSummary(file); } catch { summary = "This file could not be read in the browser. Try a text-based PDF, TXT, or Markdown document."; }
      return { id: Date.now() + index, name: file.name, type, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, status: "Indexing", summary };
    }));
    if (!additions.length) return;
    setDocuments((items) => [...additions, ...items]);
    notify(`${additions.length} source${additions.length === 1 ? "" : "s"} added to the knowledge base`);
    window.setTimeout(() => setDocuments((items) => items.map((item) => additions.some((addition) => addition.id === item.id) ? { ...item, status: "Ready" } : item)), 900);
    event.target.value = "";
  };

  const answerWithTestAi = (question: string) => getTestAnswer(question, sourceData, messages.length);
  const appendTestAnswer = (question: string) => setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answerWithTestAi(question) }]);
  const askBot = async (question: string, mode: ChatMode) => {
    setMessages((items) => [...items, { id: Date.now(), role: "user", content: question }]);
    setIsAnswering(true);
    if (mode === "test") {
      window.setTimeout(() => { appendTestAnswer(question); setIsAnswering(false); }, 420);
      return;
    }
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, sources: sourceData }) });
      const payload = (await response.json()) as { answer?: string; source?: string; mode?: "test" | "live" };
      const liveAnswer = typeof payload.answer === "string" ? payload.answer.trim() : "";
      if (response.ok && liveAnswer) {
        setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", content: liveAnswer, source: payload.source ?? (payload.mode === "test" ? "Helpwise Test AI" : "Live answer from your sources") }]);
        if (payload.mode === "test") notify("No OpenAI key is configured, so the free Test AI answered through /api/chat.");
      }
      else { appendTestAnswer(question); notify("Live API is not configured, so Helpwise used free Test AI."); }
    } catch { appendTestAnswer(question); notify("Test AI answered because the live connection is unavailable."); } finally { setIsAnswering(false); }
  };

  const saveSettings = (nextSettings: BotSettings) => { writeBotSettings(nextSettings); notify("Settings saved. The widget now uses this name, greeting, and accent color."); };
  const activatePro = () => { setPlan("Pro"); setBillingStep(null); notify("Pro is active. This was a test payment — no card was charged."); };
  const embedCode = `<script async src="${widgetOrigin}/widget.js" data-bot="orbit_7Q92"></script>`;
  const copyCode = async () => { await navigator.clipboard?.writeText(embedCode); setCopied(true); notify("Embed code copied"); window.setTimeout(() => setCopied(false), 1800); };

  const overview = <div className="space-y-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Thursday, September 11</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em] text-[#273128]">Good morning, Alex.</h1><p className="mt-2 text-sm text-[#7d877c]">Your support guide is live and ready for customers.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#354238] hover:shadow-lg" onClick={() => goTo("widget")} type="button">Open live widget <ChevronRight size={15} /></button></div><div className="grid gap-3 sm:grid-cols-3">{[["Knowledge sources", String(documents.length), "All indexed", Database], ["Answers this month", "438", "↑ 18% vs. Aug", MessageCircleMore], ["Source confidence", "93%", "Healthy", BadgeCheck]].map(([label, value, note, Icon]) => { const MetricIcon = Icon as LucideIcon; return <article className="rounded-2xl border border-[#e0e6dc] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9dcc0] hover:shadow-lg" key={label as string}><div className="flex items-start justify-between"><p className="text-xs font-medium text-[#879087]">{label as string}</p><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef5e8] text-[#6a953e] transition-transform duration-300 group-hover:rotate-6"><MetricIcon size={15} /></span></div><p className="mt-4 text-2xl font-semibold tracking-[-.05em]">{value as string}</p><p className="mt-1 text-[11px] font-bold text-[#709744]">{note as string}</p></article>; })}</div><div className="grid gap-5 xl:grid-cols-[1.07fr_.93fr]"><ChatPanel botName={settings.name} isAnswering={isAnswering} messages={messages} onAsk={askBot} /><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-[-.03em]">Your bot</h2><p className="mt-1 text-xs text-[#899289]">The assistant your customers meet</p></div><button className="inline-flex items-center gap-1 text-xs font-bold text-[#6e9442] transition hover:translate-x-0.5 hover:text-[#456c25]" onClick={() => goTo("settings")} type="button">Configure <ChevronRight size={13} /></button></div><div className="mt-6"><BotPreview settings={settings} /></div><div className="mt-5 border-t border-[#edf0eb] pt-4"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a0a9a0]">Recent source activity</p>{documents.slice(0, 2).map((document) => <div className="mt-3 flex items-center justify-between text-xs" key={document.id}><span className="max-w-[70%] truncate text-[#5c665c]">{document.name}</span><StatusPill status={document.status} /></div>)}</div></section></div></div>;

  const knowledge = <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Source of truth</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Knowledge base</h1><p className="mt-2 text-sm text-[#7d877c]">Upload the product knowledge Orbit should use when it answers.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#354238] hover:shadow-lg" onClick={() => fileInput.current?.click()} type="button"><UploadCloud size={16} />Add sources</button><input accept=".pdf,.docx,.txt,.md" className="hidden" multiple onChange={addFiles} ref={fileInput} type="file" /></div><div className="mt-6 overflow-hidden rounded-2xl border border-[#e0e6dc] bg-white"><div className="flex items-center justify-between border-b border-[#e8ece5] px-5 py-4"><p className="text-sm font-bold">{documents.length} sources</p><p className="text-xs text-[#8c968b]">PDF, DOCX, TXT, Markdown</p></div><div className="divide-y divide-[#edf0eb]">{documents.map((document) => <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#f9fbf7] sm:flex-row sm:items-center sm:justify-between" key={document.id}><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf5e8] text-[#668d40]"><FileText size={16} /><small className="-ml-1 mt-5 text-[8px] font-bold">{document.type}</small></span><div className="min-w-0"><p className="truncate text-sm font-bold text-[#485348]">{document.name}</p><p className="mt-0.5 truncate text-xs text-[#939c92]">{document.size} · {document.summary}</p></div></div><div className="flex items-center gap-4"><StatusPill status={document.status} /><button aria-label={`Remove ${document.name}`} className="text-xs font-bold text-[#a1aaa0] transition hover:text-[#ca6359]" onClick={() => { setDocuments((items) => items.filter((item) => item.id !== document.id)); notify("Source removed"); }} type="button">Remove</button></div></div>)}</div></div><div className="mt-4 flex gap-3 rounded-xl border border-dashed border-[#cfd9c9] bg-[#f7faf4] p-5 text-sm leading-6 text-[#61715d]"><CircleHelp className="mt-0.5 shrink-0 text-[#759e4c]" size={18} /><p><b>Demo storage is active.</b> PDF, TXT, and Markdown text is read locally for Test AI. The included Supabase schema provides private storage and vector search when project credentials are configured.</p></div></div>;

  const widget = <div><p className="text-sm font-medium text-[#73806e]">Meet customers where they are</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Embeddable widget</h1><p className="mt-2 text-sm text-[#7d877c]">Copy one script tag. Saved bot settings are used by the actual widget, not only this preview.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-[-.03em]">Install Helpwise</h2><p className="mt-1 text-xs text-[#899289]">Paste this before the closing body tag</p></div><StatusPill status="Ready" /></div><pre className="mt-5 overflow-x-auto rounded-xl bg-[#202823] p-4 text-xs leading-6 text-[#d5e0ce]"><code suppressHydrationWarning>{embedCode}</code></pre><div className="mt-3 flex flex-wrap gap-3"><button className="inline-flex items-center gap-2 rounded-lg border border-[#d5ded0] px-3 py-2 text-xs font-bold text-[#576557] transition-all hover:-translate-y-px hover:border-[#a9c995] hover:bg-[#f5faef] hover:shadow-sm" onClick={copyCode} type="button"><Clipboard size={13} />{copied ? "Copied" : "Copy code"}</button><a className="inline-flex items-center gap-1 rounded-lg border border-[#d5ded0] px-3 py-2 text-xs font-bold text-[#576557] transition-all hover:-translate-y-px hover:border-[#a9c995] hover:bg-[#f5faef] hover:shadow-sm" href="/demo.html" rel="noreferrer" target="_blank">Open demo site <ChevronRight size={13} /></a></div><div className="mt-7 border-t border-[#edf0eb] pt-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#9aa399]">Visibility</p><div className="mt-3 flex items-center justify-between rounded-xl bg-[#f4f8f0] p-3"><div><p className="text-sm font-bold text-[#4e5b4f]">Widget is live</p><p className="mt-0.5 text-xs text-[#899489]">Available on allowed domains</p></div><span className="h-6 w-11 rounded-full bg-[#78a946] p-1 shadow-inner"><i className="block ml-auto h-4 w-4 rounded-full bg-white shadow transition" /></span></div></div></section><div className="rounded-2xl bg-[#edf3e7] p-6"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#728d50]">Live preview</p><div className="mt-6 flex min-h-72 items-end justify-end rounded-xl border border-[#dce5d7] bg-[radial-gradient(#cbd6c6_1px,transparent_1px)] bg-[length:16px_16px] p-4"><BotPreview settings={settings} /></div></div></div></div>;

  const settingsPage = <SettingsEditor documentCount={documents.length} key={JSON.stringify(settings)} onSave={saveSettings} onUpgrade={() => setBillingStep("plans")} plan={plan} settings={settings} />;
  const content = active === "overview" ? overview : active === "knowledge" ? knowledge : active === "conversations" ? <ChatPanel botName={settings.name} isAnswering={isAnswering} messages={messages} onAsk={askBot} /> : active === "widget" ? widget : settingsPage;

  return <main className="h-dvh overflow-hidden bg-[#f7f9f5] text-[#283228]"><div className="flex h-full"><aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-[#303b32] bg-[#202823] p-4 text-[#cbd4ca] lg:flex"><Link className="flex items-center gap-2.5 px-2 py-2 font-semibold tracking-[-.04em] text-white" href="/"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9fb97] text-[#385029] transition-transform duration-300 hover:rotate-6"><Sparkles size={17} /></span><span className="text-xl">helpwise</span></Link><div className="mt-9"><p className="px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#829080]">Workspace</p><div className="mt-2 space-y-1">{navigation.map(({ id, label, icon: Icon }) => <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${active === id ? "bg-white/10 font-bold text-white shadow-inner" : "text-[#a7b1a6] hover:translate-x-1 hover:bg-white/[.08] hover:text-white"}`} key={id} onClick={() => goTo(id)} type="button"><span className={`grid h-7 w-7 place-items-center rounded-lg transition-all duration-200 ${active === id ? "bg-[#d9fb97] text-[#3f5634]" : "bg-white/[.06] text-[#bec8bc]"}`}><Icon size={15} /></span>{label}</button>)}</div></div><div className="mt-auto rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(217,251,151,.13),rgba(255,255,255,.03))] p-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-xl" style={{ backgroundColor: settings.accent }}><Image alt="Orbit mascot" className="scale-[1.7]" height={32} src="/mascot/orbit-support-mascot.png" width={32} /></span><p className="text-xs font-bold text-white">{settings.name}</p></div><p className="mt-2 text-[11px] leading-4 text-[#a5b1a4]">Your customer-facing AI guide.</p><button className="mt-3 w-full rounded-lg bg-[#d9fb97] px-2 py-2 text-xs font-bold text-[#405335] transition-all duration-200 hover:-translate-y-px hover:shadow-lg" onClick={() => goTo("widget")} type="button">Open widget</button></div></aside><div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"><header className="flex h-[69px] shrink-0 items-center justify-between border-b border-[#e0e6dc] bg-white px-5 sm:px-8"><div className="flex items-center gap-2 lg:hidden"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#202823] text-[#d9fb97]"><Sparkles size={15} /></span><span className="font-semibold tracking-[-.04em]">helpwise</span></div><p className="hidden text-xs text-[#939c92] lg:block">Orbit Labs / <span className="font-bold text-[#596459]">Support workspace</span></p><div className="flex items-center gap-3"><button className="hidden items-center gap-2 rounded-lg border border-[#dce3d8] px-3 py-2 text-xs font-bold text-[#657264] transition-all hover:-translate-y-px hover:border-[#aac99a] hover:bg-[#f7fbf4] sm:inline-flex" onClick={() => setBillingStep("plans")} type="button"><CreditCard size={13} />Plan: {plan}</button><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e9d4b5] text-xs font-bold text-[#7a6043]">AP</span></div></header><section className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 lg:py-9" ref={contentScrollRef}><div className="mx-auto max-w-6xl">{content}</div></section></div></div>{toast && <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-xl bg-[#202823] px-4 py-3 text-sm font-medium text-white shadow-xl"><BadgeCheck size={16} className="text-[#d9fb97]" />{toast}</div>}{billingStep === "plans" && <div className="fixed inset-0 z-40 grid place-items-center bg-[#172018]/55 p-4 backdrop-blur-sm"><section aria-modal="true" className="w-full max-w-2xl rounded-[1.5rem] bg-white p-5 shadow-2xl sm:p-6" role="dialog"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#76994b]">Plan selection</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">Choose your growth path</h2><p className="mt-2 text-sm text-[#788277]">Choose a plan, see exactly what changes, then use the card sandbox.</p></div><button aria-label="Close plan selector" className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f4ef] text-[#7f897e] transition hover:rotate-90 hover:bg-[#e7eee3]" onClick={() => setBillingStep(null)} type="button"><X size={16} /></button></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-[.1em] text-[#758075]"><span className="rounded-lg bg-[#edf6e6] px-2 py-2 text-[#628c38]">1. Choose</span><span className="rounded-lg bg-[#f5f7f3] px-2 py-2">2. Test card</span><span className="rounded-lg bg-[#f5f7f3] px-2 py-2">3. Active</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{(["Starter", "Pro"] as Plan[]).map((item) => { const chosen = planChoice === item; return <button aria-pressed={chosen} className={`relative rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${chosen ? "border-[#78a748] bg-[#f5faed] ring-2 ring-[#d9efbd]" : "border-[#e0e6dc] hover:border-[#b7caad]"}`} key={item} onClick={() => setPlanChoice(item)} type="button">{chosen && <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-[#7ca94c] text-white"><Check size={14} strokeWidth={3} /></span>}<div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-xl ${item === "Pro" ? "bg-[#d9fb97] text-[#405335]" : "bg-[#eef2ec] text-[#73806e]"}`}>{item === "Pro" ? <Sparkles size={15} /> : <ReceiptText size={15} />}</span><p className="font-bold">{item}</p></div><p className="mt-4 text-3xl font-semibold tracking-[-.06em]">{item === "Starter" ? "$0" : "$39"}<span className="ml-1 text-sm font-medium tracking-normal text-[#909a8f]">/ month</span></p><p className="mt-3 text-xs leading-5 text-[#788277]">{item === "Starter" ? "One bot, 20 sources, and Helpwise branding." : "Five bots, unlimited sources, custom styling, and no branding."}</p></button>; })}</div><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#354238] hover:shadow-lg" onClick={() => planChoice === "Pro" ? setBillingStep("checkout") : (setPlan("Starter"), setBillingStep(null), notify("Starter remains active."))} type="button">{planChoice === "Pro" ? "Continue to test payment" : "Keep Starter"}<ChevronRight size={15} /></button><p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-[#8b9689]"><LockKeyhole size={11} />No card data is stored in this demo.</p></section></div>}{billingStep === "checkout" && <TestCheckout onClose={() => setBillingStep("plans")} onPaid={activatePro} />}</main>;
}
