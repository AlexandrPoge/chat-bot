"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { getTestAnswer } from "@/lib/test-assistant";

type Message = {
  role: "user" | "assistant";
  content: string;
  source?: string;
  followUp?: string;
};

const demoSources = [
  { name: "Team collaboration guide.pdf", summary: "Project guests can view deliverables and comment. Owners invite guests from the Share menu." },
  { name: "Billing & plans.md", summary: "Pro includes custom colors, domain allowlists, unlimited sources, and no Helpwise branding." },
  { name: "Product onboarding.docx", summary: "New accounts create a workspace, connect a product, and invite teammates during onboarding." },
];

export default function WidgetClient({ botId }: { botId: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I’m Orbit. Ask me about client access, onboarding, or plans." }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;

    setMessages((items) => [...items, { role: "user", content: value }]);
    setQuestion("");
    setLoading(true);

    window.setTimeout(() => {
      const answer = getTestAnswer(value, demoSources, messages.length);
      setMessages((items) => [...items, { role: "assistant", ...answer }]);
      setLoading(false);
    }, 420);
  };

  return (
    <main className="flex min-h-screen items-end bg-transparent p-0 text-[#303a30]">
      <section className="flex h-[540px] w-full flex-col overflow-hidden rounded-[22px] border border-[#dce5d8] bg-white shadow-[0_18px_55px_rgba(24,40,28,.18)]">
        <header className="flex items-center gap-3 bg-[#202823] px-5 py-4 text-white">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#d9fb97]"><Image alt="Orbit support mascot" className="scale-[1.7] object-contain" height={36} priority src="/mascot/orbit-support-mascot.png" width={36} /></span>
          <div><p className="text-sm font-semibold">Orbit support</p><p className="mt-0.5 text-[11px] text-[#b9c4b8]">Usually replies instantly</p></div>
          <span className="ml-auto rounded-full bg-[#d9fb97]/15 px-2 py-1 text-[10px] font-semibold text-[#d9fb97]">Test AI · free</span>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfcfa] p-4">
          {messages.map((message, index) => (
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${message.role}-${index}`}>
              <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 ${message.role === "user" ? "rounded-tr-md bg-[#202823] text-white" : "rounded-tl-md border border-[#e0e7dc] bg-white text-[#536053]"}`}>
                {message.content}
                {message.source && <p className="mt-2 border-t border-[#e5eddf] pt-2 text-[10px] font-semibold text-[#709746]">↗ {message.source}</p>}
                {message.followUp && <p className="mt-2 text-[11px] text-[#778476]">{message.followUp}</p>}
              </div>
            </div>
          ))}
          {loading && <div className="w-fit rounded-2xl rounded-tl-md border border-[#e0e7dc] bg-white px-3.5 py-2.5 text-xs text-[#8b9689]">Orbit is thinking…</div>}
        </div>
        <form className="border-t border-[#e6ebe3] bg-white p-3" onSubmit={sendMessage}>
          <div className="flex items-center gap-2 rounded-xl border border-[#dce5d8] p-1.5">
            <input aria-label="Ask Orbit a question" className="min-w-0 flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[#a4aca2]" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question…" value={question} />
            <button aria-label="Send question" className="grid h-8 w-8 place-items-center rounded-lg bg-[#d9fb97] text-sm font-bold text-[#405735] disabled:opacity-50" disabled={!question.trim() || loading} type="submit">↑</button>
          </div>
          <p className="mt-2 text-center text-[9px] text-[#a2aba0]">Unlimited Test AI · no external API calls · bot {botId}</p>
        </form>
      </section>
    </main>
  );
}
