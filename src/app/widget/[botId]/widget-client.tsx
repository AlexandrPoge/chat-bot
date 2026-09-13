"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { WidgetComposer } from "@/features/widget/widget-composer";
import { WidgetHeader } from "@/features/widget/widget-header";
import { WidgetMessages } from "@/features/widget/widget-messages";
import { usePublicWidget } from "@/features/widget/use-public-widget";
import type { WidgetMessage } from "@/features/widget/types";

type Props = { botId: string; sourceId?: string };

export default function WidgetClient({ botId, sourceId }: Props) {
  const { available, loading: loadingBot, settings, source: activeSource } = usePublicWidget(botId, sourceId);
  const [messages, setMessages] = useState<WidgetMessage[]>([{ id: 1, role: "assistant", content: "" }]);
  const [conversationId, setConversationId] = useState<string>();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const visitorId = useRef(`widget-${botId}-${crypto.randomUUID()}`);
  const previousSource = useRef<number | null>(null);
  useEffect(() => {
    if (previousSource.current !== null && previousSource.current !== activeSource?.id) {
      setMessages([{ id: Date.now(), role: "assistant", content: settings.welcome }]);
    }
    previousSource.current = activeSource?.id ?? null;
  }, [activeSource?.id, settings.welcome]);
  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;
    setMessages((items) => [...items, { id: Date.now(), role: "user", content: value }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ botId, conversationId, question: value, sources: activeSource ? [activeSource] : [], visitorId: visitorId.current }) });
      const body = await response.json() as { answer?: string; conversationId?: string; source?: string };
      if (response.ok && body.answer?.trim()) {
        if (body.conversationId) setConversationId(body.conversationId);
        setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", content: body.answer ?? "", source: body.source ?? activeSource?.name }]);
        setLoading(false);
        return;
      }
    } catch {}
    setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", content: "I couldn’t reach the knowledge service. Please try again in a moment." }]);
    setLoading(false);
  };
  if (loadingBot) return <main className="grid h-dvh place-items-center rounded-[22px] bg-white text-xs font-bold text-[#758075]">Loading assistant…</main>;
  if (!available) return <main className="grid h-dvh place-items-center rounded-[22px] bg-white p-6 text-center text-sm text-[#758075]">This assistant is not published yet.</main>;
  return <main className="h-dvh min-h-0 w-full overflow-hidden bg-transparent p-0 text-[#303a30]"><section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[22px] border border-[#dce5d8] bg-white shadow-[0_18px_55px_rgba(24,40,28,.18)]"><WidgetHeader settings={settings} /><WidgetMessages activeSource={activeSource} loading={loading} messages={messages} onPrompt={setQuestion} settings={settings} /><WidgetComposer loading={loading} onQuestionChange={setQuestion} onSubmit={sendMessage} question={question} /></section></main>;
}
