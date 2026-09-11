"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Link from "next/link";

type Document = {
  id: number;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "MD";
  size: string;
  status: "Ready" | "Indexing";
  summary: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const sourceDocuments: Document[] = [
  { id: 1, name: "Team collaboration guide.pdf", type: "PDF", size: "2.4 MB", status: "Ready", summary: "Project guests can view deliverables and comment. Owners invite guests from the Share menu." },
  { id: 2, name: "Billing & plans.md", type: "MD", size: "18 KB", status: "Ready", summary: "Pro includes custom colors, domain allowlists, unlimited sources, and no Helpwise branding." },
  { id: 3, name: "Product onboarding.docx", type: "DOCX", size: "1.1 MB", status: "Ready", summary: "New accounts create their first workspace, connect a product, and invite teammates in onboarding." },
];

const navigation = [
  ["overview", "Overview", "✦"],
  ["knowledge", "Knowledge", "◫"],
  ["conversations", "Conversations", "◌"],
  ["widget", "Widget", "⌘"],
  ["settings", "Settings", "⚙"],
] as const;

function answerFor(question: string, documents: Document[]) {
  const normalized = question.toLowerCase();
  if (normalized.includes("invite") || normalized.includes("client") || normalized.includes("guest")) {
    return { content: "Yes. On the project page, choose Share and enter their email. Guests can view deliverables and comment, but can’t change project settings.", source: "Team collaboration guide.pdf" };
  }
  if (normalized.includes("plan") || normalized.includes("billing") || normalized.includes("pro") || normalized.includes("price")) {
    return { content: "Pro is $39/month. It includes unlimited knowledge sources, five active bots, custom colors, a domain allowlist, and a widget without Helpwise branding.", source: "Billing & plans.md" };
  }
  if (normalized.includes("start") || normalized.includes("onboard") || normalized.includes("workspace")) {
    return { content: "Start by creating your workspace, connecting a product, and inviting teammates. The onboarding guide walks through each step in order.", source: "Product onboarding.docx" };
  }
  const bestSource = documents[0];
  return { content: `I found this in ${bestSource.name}: ${bestSource.summary} Ask a more specific question and I’ll point you to the exact source.`, source: bestSource.name };
}

function StatusPill({ status }: { status: Document["status"] }) {
  const ready = status === "Ready";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${ready ? "bg-[#eef6e6] text-[#628d37]" : "bg-[#fff5dc] text-[#ac761f]"}`}><i className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-[#78a946]" : "bg-[#e4a43e]"}`} />{status}</span>;
}

function BotPreview({ compact = false }: { compact?: boolean }) {
  return <div className={`rounded-[1.25rem] border border-[#dde4da] bg-white p-4 shadow-[0_12px_30px_-22px_rgba(38,57,34,.35)] ${compact ? "max-w-sm" : ""}`}><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e5f7b9] font-bold text-[#52742a]">O</span><div><p className="text-xs font-semibold text-[#38423a]">Orbit support</p><p className="text-[10px] text-[#8b9389]">Usually replies instantly</p></div><span className="ml-auto text-[#9ba49a]">×</span></div><div className="mt-5 rounded-xl bg-[#f1f5ed] p-3 text-xs leading-5 text-[#556056]">Hi! I&apos;m Orbit. Ask me anything about the product, account, or billing.</div><div className="mt-3 flex items-center rounded-xl border border-[#e3e8e0] px-3 py-2.5 text-[11px] text-[#a2aaa0]">Ask a question… <span className="ml-auto grid h-5 w-5 place-items-center rounded-md bg-[#e5f7b9] text-[#5c7c34]">↑</span></div><p className="mt-3 text-center text-[9px] font-medium text-[#a0a89e]">Powered by Helpwise</p></div>;
}

export default function DashboardClient() {
  const [active, setActive] = useState<(typeof navigation)[number][0]>("overview");
  const [documents, setDocuments] = useState<Document[]>(sourceDocuments);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", content: "Hi Alex — I’m ready to answer from the 3 sources in your knowledge base. What would you like to test?" }]);
  const [question, setQuestion] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [plan, setPlan] = useState<"Starter" | "Pro">("Starter");
  const [showBilling, setShowBilling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const additions = files.map((file, index): Document => {
      const extension = file.name.split(".").pop()?.toUpperCase();
      return { id: Date.now() + index, name: file.name, type: extension === "PDF" || extension === "DOCX" || extension === "TXT" ? extension : "MD", size: `${Math.max(1, Math.round(file.size / 1024))} KB`, status: "Indexing", summary: "New source uploaded from your computer. It will be searchable as soon as indexing finishes." };
    });
    if (!additions.length) return;
    setDocuments((items) => [...additions, ...items]);
    notify(`${additions.length} source${additions.length > 1 ? "s" : ""} added to your knowledge base`);
    window.setTimeout(() => setDocuments((items) => items.map((item) => additions.some((addition) => addition.id === item.id) ? { ...item, status: "Ready" } : item)), 1100);
    event.target.value = "";
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || isAnswering) return;
    setMessages((items) => [...items, { id: Date.now(), role: "user", content: value }]);
    setQuestion("");
    setIsAnswering(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: value,
          sources: documents.map(({ name, summary }) => ({ name, summary })),
        }),
      });
      const payload = (await response.json()) as { answer?: string };
      const liveAnswer = payload.answer;
      if (response.ok && typeof liveAnswer === "string" && liveAnswer.length > 0) {
        setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", content: liveAnswer, source: "Live answer from your sources" }]);
      } else {
        const answer = answerFor(value, documents);
        setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answer }]);
      }
    } catch {
      const answer = answerFor(value, documents);
      setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answer }]);
    } finally {
      setIsAnswering(false);
    }
  };

  const embedCode = '<script async src="https://widget.helpwise.ai/v1.js" data-bot="orbit_7Q92"></script>';
  const copyCode = async () => {
    await navigator.clipboard?.writeText(embedCode);
    setCopied(true);
    notify("Embed code copied to clipboard");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const openBilling = () => { setShowBilling(true); };
  const startPro = () => { setPlan("Pro"); setShowBilling(false); notify("Pro trial activated — billing is simulated in this demo"); };

  const Chat = () => <section className="flex min-h-[510px] flex-col rounded-2xl border border-[#e0e6dc] bg-white"><div className="flex items-center justify-between border-b border-[#e7ebe4] px-5 py-4"><div><h2 className="font-semibold tracking-[-0.03em]">Test your bot</h2><p className="mt-0.5 text-xs text-[#8d968c]">Answers are grounded in your uploaded sources</p></div><StatusPill status="Ready" /></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((message) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}><div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e1e7dd] bg-[#f8faf6] text-[#4d584d]"}`}>{message.content}{message.source && <p className="mt-2 flex items-center gap-1.5 border-t border-[#dfe8d8] pt-2 text-[11px] font-semibold text-[#688e3d]"><span>↗</span> {message.source}</p>}</div></div>)}{isAnswering && <div className="w-fit rounded-2xl rounded-tl-md border border-[#e1e7dd] bg-[#f8faf6] px-4 py-3 text-sm text-[#839083]"><span className="inline-flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#91a88b]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#91a88b] [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#91a88b] [animation-delay:240ms]" /></span></div>}</div><form className="m-4 flex gap-2 rounded-xl border border-[#dce4d8] p-2" onSubmit={sendMessage}><input aria-label="Ask your bot a question" className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[#a4aca2]" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your product…" value={question} /><button className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9fb97] text-sm font-bold text-[#33422e] disabled:opacity-50" disabled={!question.trim() || isAnswering} type="submit">↑</button></form></section>;

  const Overview = () => <div className="space-y-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Thursday, September 11</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em] text-[#273128]">Good morning, Alex.</h1><p className="mt-2 text-sm text-[#7d877c]">Your support guide is live and ready for customers.</p></div><button className="rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#354238]" onClick={() => setActive("widget")}>View live widget ↗</button></div><div className="grid gap-3 sm:grid-cols-3">{[["Knowledge sources", String(documents.length), "All indexed"], ["Answers this month", "438", "↑ 18% vs. Aug"], ["Source confidence", "93%", "Healthy"]].map(([label, value, note]) => <article className="rounded-2xl border border-[#e0e6dc] bg-white p-4" key={label}><p className="text-xs font-medium text-[#879087]">{label}</p><p className="mt-4 text-2xl font-semibold tracking-[-0.05em]">{value}</p><p className="mt-1 text-[11px] font-medium text-[#709744]">{note}</p></article>)}</div><div className="grid gap-5 xl:grid-cols-[1.07fr_.93fr]"><Chat /><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-[-0.03em]">Your bot</h2><p className="mt-1 text-xs text-[#899289]">The assistant your customers meet</p></div><button className="text-xs font-semibold text-[#6e9442]" onClick={() => setActive("settings")}>Configure</button></div><div className="mt-6"><BotPreview compact /></div><div className="mt-5 border-t border-[#edf0eb] pt-4"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a0a9a0]">Recent source activity</p>{documents.slice(0, 2).map((document) => <div className="mt-3 flex items-center justify-between text-xs" key={document.id}><span className="max-w-[70%] truncate text-[#5c665c]">{document.name}</span><StatusPill status={document.status} /></div>)}</div></section></div></div>;

  const Knowledge = () => <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Source of truth</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Knowledge base</h1><p className="mt-2 text-sm text-[#7d877c]">Upload the product knowledge Orbit should use when it answers.</p></div><button className="rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => fileInput.current?.click()}>+ Add sources</button><input accept=".pdf,.docx,.txt,.md" className="hidden" multiple onChange={handleFiles} ref={fileInput} type="file" /></div><div className="mt-6 overflow-hidden rounded-2xl border border-[#e0e6dc] bg-white"><div className="flex items-center justify-between border-b border-[#e8ece5] px-5 py-4"><p className="text-sm font-semibold">{documents.length} sources</p><p className="text-xs text-[#8c968b]">PDF, DOCX, TXT, Markdown</p></div><div className="divide-y divide-[#edf0eb]">{documents.map((document) => <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={document.id}><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0f5eb] text-[10px] font-bold text-[#6a8745]">{document.type}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#485348]">{document.name}</p><p className="mt-0.5 truncate text-xs text-[#939c92]">{document.size} · {document.summary}</p></div></div><div className="flex items-center gap-4"><StatusPill status={document.status} /><button aria-label={`Remove ${document.name}`} className="text-xs font-medium text-[#a1aaa0] hover:text-[#ca6359]" onClick={() => { setDocuments((items) => items.filter((item) => item.id !== document.id)); notify("Source removed"); }}>Remove</button></div></div>)}</div></div><div className="mt-4 rounded-xl border border-dashed border-[#cfd9c9] bg-[#f7faf4] p-5 text-sm text-[#61715d]"><b>Demo mode:</b> sources are stored only in this browser. Connect Supabase in the next step to persist uploads and index every document with embeddings.</div></div>;

  const Widget = () => <div><p className="text-sm font-medium text-[#73806e]">Meet customers where they are</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Embeddable widget</h1><p className="mt-2 text-sm text-[#7d877c]">Copy one script tag. Orbit will match your brand and answer from this bot&apos;s sources.</p><div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-[-0.03em]">Install Helpwise</h2><p className="mt-1 text-xs text-[#899289]">Paste this before the closing body tag</p></div><StatusPill status="Ready" /></div><pre className="mt-5 overflow-x-auto rounded-xl bg-[#202823] p-4 text-xs leading-6 text-[#d5e0ce]"><code>{embedCode}</code></pre><button className="mt-3 rounded-lg border border-[#d5ded0] px-3 py-2 text-xs font-semibold text-[#576557]" onClick={copyCode}>{copied ? "Copied!" : "Copy code"}</button><div className="mt-7 border-t border-[#edf0eb] pt-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#9aa399]">Visibility</p><div className="mt-3 flex items-center justify-between rounded-xl bg-[#f4f8f0] p-3"><div><p className="text-sm font-semibold text-[#4e5b4f]">Widget is live</p><p className="mt-0.5 text-xs text-[#899489]">Available on allowed domains</p></div><span className="h-6 w-11 rounded-full bg-[#78a946] p-1"><i className="block ml-auto h-4 w-4 rounded-full bg-white shadow" /></span></div></div></section><div className="rounded-2xl bg-[#edf3e7] p-6"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#728d50]">Live preview</p><div className="mt-6 flex min-h-80 items-end justify-end rounded-xl border border-[#dce5d7] bg-[radial-gradient(#cbd6c6_1px,transparent_1px)] bg-[length:16px_16px] p-4"><BotPreview compact /></div></div></div></div>;

  const Settings = () => <div><p className="text-sm font-medium text-[#73806e]">Make Orbit yours</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Bot settings</h1><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="space-y-5 rounded-2xl border border-[#e0e6dc] bg-white p-5"><label className="block text-sm font-semibold text-[#4a554b]">Bot name<input className="mt-2 w-full rounded-xl border border-[#dce3d8] px-3 py-2.5 text-sm outline-none focus:border-[#92ae70]" defaultValue="Orbit support" /></label><label className="block text-sm font-semibold text-[#4a554b]">Welcome message<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#dce3d8] px-3 py-2.5 text-sm font-normal leading-6 outline-none focus:border-[#92ae70]" defaultValue="Hi! I’m Orbit. Ask me anything about the product, account, or billing." /></label><div><p className="text-sm font-semibold text-[#4a554b]">Accent color</p><div className="mt-3 flex gap-3">{["#D9FB97", "#B8D8FF", "#F7CF9C", "#E9C8FF"].map((color) => <button aria-label={`Set ${color} as accent color`} className="h-8 w-8 rounded-full ring-offset-2 hover:ring-2 hover:ring-[#87a968]" key={color} style={{ backgroundColor: color }} />)}</div></div><button className="rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => notify("Bot settings saved")}>Save changes</button></section><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><h2 className="font-semibold tracking-[-0.03em]">Plan & usage</h2><p className="mt-2 text-sm leading-6 text-[#7b857a]">You are on the <b>{plan}</b> plan.</p><div className="mt-5 rounded-xl bg-[#f4f8f0] p-4"><p className="text-xs font-semibold text-[#6e7f69]">Knowledge sources</p><p className="mt-2 text-2xl font-semibold tracking-[-.05em]">{documents.length} <span className="text-sm font-medium text-[#96a095]">/ {plan === "Starter" ? 20 : "∞"}</span></p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dce5d7]"><div className="h-full w-[15%] rounded-full bg-[#86aa55]" /></div></div>{plan === "Starter" && <button className="mt-5 text-sm font-semibold text-[#69913d]" onClick={openBilling}>Unlock Pro features ↗</button>}</section></div></div>;

  const renderContent = () => active === "overview" ? <Overview /> : active === "knowledge" ? <Knowledge /> : active === "conversations" ? <Chat /> : active === "widget" ? <Widget /> : <Settings />;

  return <main className="min-h-screen bg-[#f7f9f5] text-[#283228]"><div className="flex min-h-screen"><aside className="hidden w-60 shrink-0 flex-col border-r border-[#303b32] bg-[#202823] p-4 text-[#cbd4ca] lg:flex"><Link className="flex items-center gap-2.5 px-2 py-2 font-semibold tracking-[-.04em] text-white" href="/"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#d9fb97] text-[#385029]">✦</span><span className="text-xl">helpwise</span></Link><div className="mt-9"><p className="px-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#829080]">Workspace</p><div className="mt-2 space-y-1">{navigation.map(([id, label, icon]) => <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === id ? "bg-white/10 font-semibold text-white" : "text-[#a7b1a6] hover:bg-white/[.05] hover:text-white"}`} key={id} onClick={() => setActive(id)}><span className="grid h-5 w-5 place-items-center text-xs">{icon}</span>{label}</button>)}</div></div><div className="mt-auto rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-xs font-semibold text-white">Orbit support</p><p className="mt-1 text-[11px] leading-4 text-[#98a497]">Your customer-facing AI guide.</p><button className="mt-3 w-full rounded-lg bg-[#d9fb97] px-2 py-2 text-xs font-bold text-[#405335]" onClick={() => setActive("widget")}>Open widget</button></div></aside><div className="min-w-0 flex-1"><header className="flex h-[69px] items-center justify-between border-b border-[#e0e6dc] bg-white px-5 sm:px-8"><div className="flex items-center gap-2 lg:hidden"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#202823] text-[#d9fb97]">✦</span><span className="font-semibold tracking-[-.04em]">helpwise</span></div><div className="hidden lg:block"><p className="text-xs text-[#939c92]">Orbit Labs / <span className="font-semibold text-[#596459]">Support workspace</span></p></div><div className="flex items-center gap-3"><button className="hidden rounded-lg border border-[#dce3d8] px-3 py-2 text-xs font-semibold text-[#657264] sm:block" onClick={openBilling}>Plan: {plan}</button><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e9d4b5] text-xs font-bold text-[#7a6043]">AP</span></div></header><section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{renderContent()}</section></div></div>{toast && <div className="fixed bottom-5 right-5 z-30 rounded-xl bg-[#202823] px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}{showBilling && <div className="fixed inset-0 z-20 grid place-items-center bg-[#172018]/35 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#76994b]">Demo billing</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">Choose how Helpwise grows with you</h2></div><button className="text-xl text-[#8f998e]" onClick={() => setShowBilling(false)}>×</button></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#e0e6dc] p-4"><p className="font-semibold">Starter</p><p className="mt-2 text-2xl font-semibold">$0 <span className="text-xs font-medium text-[#8f988e]">/ month</span></p><p className="mt-3 text-xs leading-5 text-[#7c867b]">One bot, 20 sources, and Helpwise branding.</p></div><div className="rounded-xl bg-[#202823] p-4 text-white"><p className="font-semibold">Pro</p><p className="mt-2 text-2xl font-semibold">$39 <span className="text-xs font-medium text-[#b1bdb0]">/ month</span></p><p className="mt-3 text-xs leading-5 text-[#bdc8bc]">Unlimited sources, custom styling, and no branding.</p><button className="mt-4 w-full rounded-lg bg-[#d9fb97] px-3 py-2 text-xs font-bold text-[#31432d]" onClick={startPro}>Start test trial</button></div></div><p className="mt-5 text-center text-[11px] text-[#9aa39a]">No card is charged. This is a working mock payment flow for the product demo.</p></div></div>}</main>;
}
