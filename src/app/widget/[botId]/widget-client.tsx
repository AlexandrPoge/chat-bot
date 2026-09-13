"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { WidgetComposer } from "@/features/widget/widget-composer";
import { WidgetHeader } from "@/features/widget/widget-header";
import { WidgetMessages } from "@/features/widget/widget-messages";
import { usePublicWidget } from "@/features/widget/use-public-widget";
import type { WidgetMessage } from "@/features/widget/types";
import { getTestAnswer } from "@/lib/test-assistant";

type Props = { botId: string; sourceId?: string };

export default function WidgetClient({ botId, sourceId }: Props) {
  const { settings, source: activeSource } = usePublicWidget(botId, sourceId);
  const [messages, setMessages] = useState<WidgetMessage[]>([{ id: 1, role: "assistant", content: "" }]);
  const [conversationId, setConversationId] = useState<string>();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
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
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, question: value, sources: activeSource ? [activeSource] : [], visitorId: `widget-${botId}` }) });
      const body = await response.json() as { answer?: string; conversationId?: string; source?: string };
      if (response.ok && body.answer?.trim()) {
        if (body.conversationId) setConversationId(body.conversationId);
        setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", content: body.answer ?? "", source: body.source ?? activeSource?.name }]);
        setLoading(false);
        return;
      }
    } catch {
      // A local source-grounded reply is safer than leaving a customer without an answer.
    }
    window.setTimeout(() => {
      const answer = getTestAnswer(value, activeSource ? [activeSource] : [], Date.now());
      setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answer }]);
      setLoading(false);
    }, 360);
  };
  return <main className="h-dvh min-h-0 w-full overflow-hidden bg-transparent p-0 text-[#303a30]"><section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[22px] border border-[#dce5d8] bg-white shadow-[0_18px_55px_rgba(24,40,28,.18)]"><WidgetHeader settings={settings} /><WidgetMessages activeSource={activeSource} loading={loading} messages={messages} onPrompt={setQuestion} settings={settings} /><WidgetComposer loading={loading} onQuestionChange={setQuestion} onSubmit={sendMessage} question={question} /></section></main>;
}
