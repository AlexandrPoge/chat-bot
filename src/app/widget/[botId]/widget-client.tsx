"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { WidgetComposer } from "@/features/widget/widget-composer";
import { WidgetHeader } from "@/features/widget/widget-header";
import { WidgetMessages } from "@/features/widget/widget-messages";
import { useWidgetKnowledge, useWidgetSettings } from "@/features/widget/use-widget-stores";
import type { WidgetMessage } from "@/features/widget/types";
import { getTestAnswer } from "@/lib/test-assistant";

export default function WidgetClient() {
  const settings = useWidgetSettings();
  const knowledge = useWidgetKnowledge();
  const activeSource = knowledge.sources.find((source) => source.id === knowledge.activeSourceId) ?? knowledge.sources[0];
  const [messages, setMessages] = useState<WidgetMessage[]>([{ id: 1, role: "assistant", content: "" }]);
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
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: value, sources: activeSource ? [activeSource] : [] }) });
      const body = await response.json() as { answer?: string; source?: string };
      if (response.ok && body.answer?.trim()) {
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
