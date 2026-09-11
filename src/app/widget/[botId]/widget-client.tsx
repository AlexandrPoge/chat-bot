"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const demoSources = [
  { name: "Team collaboration guide.pdf", summary: "Project guests can view deliverables and comment. Owners invite guests from the Share menu." },
  { name: "Billing & plans.md", summary: "Pro includes custom colors, domain allowlists, unlimited sources, and no Helpwise branding." },
];

function demoAnswer(question: string) {
  const normalized = question.toLowerCase();
  if (normalized.includes("invite") || normalized.includes("client") || normalized.includes("guest")) {
    return { content: "Yes. On the project page, choose Share and enter their email. Guests can view deliverables and comment, but can’t change project settings.", source: "Team collaboration guide.pdf" };
  }
  if (normalized.includes("billing") || normalized.includes("pro") || normalized.includes("price")) {
    return { content: "Pro is $39/month and includes unlimited sources, custom styling, a domain allowlist, and no Helpwise branding.", source: "Billing & plans.md" };
  }
  return { content: "I can help with product collaboration and billing. Try asking how to invite a client, or what Pro includes.", source: "Helpwise demo knowledge" };
}

export default function WidgetClient({ botId }: { botId: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I’m Orbit. How can I help today?" }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;

    setMessages((items) => [...items, { role: "user", content: value }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value, sources: demoSources }),
      });
      const payload = (await response.json()) as { answer?: string };
      const liveAnswer = payload.answer;
      if (response.ok && typeof liveAnswer === "string" && liveAnswer.length > 0) {
        setMessages((items) => [...items, { role: "assistant", content: liveAnswer, source: "Orbit knowledge base" }]);
      } else {
        setMessages((items) => [...items, { role: "assistant", ...demoAnswer(value) }]);
      }
    } catch {
      setMessages((items) => [...items, { role: "assistant", ...demoAnswer(value) }]);
    } finally {
      setLoading(false);
    }
  };

  return <main className="flex min-h-screen items-end bg-transparent p-0 text-[#303a30]"><section className="flex h-[540px] w-full flex-col overflow-hidden rounded-[22px] border border-[#dce5d8] bg-white shadow-[0_18px_55px_rgba(24,40,28,.18)]"><header className="flex items-center gap-3 bg-[#202823] px-5 py-4 text-white"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9fb97] text-sm font-bold text-[#3d5630]">O</span><div><p className="text-sm font-semibold">Orbit support</p><p className="mt-0.5 text-[11px] text-[#b9c4b8]">Usually replies instantly</p></div><span className="ml-auto rounded-full bg-[#d9fb97]/15 px-2 py-1 text-[10px] font-semibold text-[#d9fb97]">Live</span></header><div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfcfa] p-4">{messages.map((message, index) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${message.role}-${index}`}><div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dc] bg-white text-[#536053]"}`}>{message.content}{message.source && <p className="mt-2 border-t border-[#e5eddf] pt-2 text-[10px] font-semibold text-[#709746]">↗ {message.source}</p>}</div></div>)}{loading && <div className="w-fit rounded-2xl rounded-tl-md border border-[#e0e7dc] bg-white px-3.5 py-2.5 text-xs text-[#8b9689]">Orbit is typing…</div>}</div><form className="border-t border-[#e6ebe3] bg-white p-3" onSubmit={sendMessage}><div className="flex items-center gap-2 rounded-xl border border-[#dce5d8] p-1.5"><input aria-label="Ask Orbit a question" className="min-w-0 flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[#a4aca2]" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" value={question} /><button aria-label="Send question" className="grid h-8 w-8 place-items-center rounded-lg bg-[#d9fb97] text-sm font-bold text-[#405735] disabled:opacity-50" disabled={!question.trim() || loading} type="submit">↑</button></div><p className="mt-2 text-center text-[9px] text-[#a2aba0]">Powered by Helpwise · bot {botId}</p></form></section></main>;
}
