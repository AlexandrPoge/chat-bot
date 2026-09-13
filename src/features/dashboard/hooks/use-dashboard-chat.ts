import { useState } from "react";
import { getTestAnswer } from "@/lib/test-assistant";
import { accessToken } from "../knowledge-api";
import type { DashboardDocument, ChatMessage, ChatMode } from "../types";

const welcome = "Hi! I’m ready to help. Ask a customer question and I’ll answer from the active knowledge source.";

function firstMessage(): ChatMessage {
  return {
    id: 1,
    role: "assistant",
    content: welcome,
  };
}

export function useDashboardChat(notify: (message: string) => void, botId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([firstMessage()]);
  const [conversationId, setConversationId] = useState<string>();
  const [isAnswering, setIsAnswering] = useState(false);
  const resetChat = () => { setMessages([firstMessage()]); setConversationId(undefined); };
  const appendTest = (question: string, source?: DashboardDocument) => {
    const answer = getTestAnswer(question, source ? [source] : [], Date.now());
    setMessages((items) => [...items, { id: Date.now() + 1, role: "assistant", ...answer }]);
  };
  const askBot = async (question: string, mode: ChatMode, source?: DashboardDocument) => {
    setMessages((items) => [...items, { id: Date.now(), role: "user", content: question }]);
    setIsAnswering(true);
    if (mode === "test") {
      window.setTimeout(() => {
        appendTest(question, source);
        setIsAnswering(false);
      }, 420);
      return;
    }
    if (!source?.cloudId || !botId) {
      appendTest(question, source);
      setIsAnswering(false);
      notify("Sync this source to Supabase before using Gemini. Test AI answered instead.");
      return;
    }
    try {
      const token = await accessToken();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ botId, conversationId, question, sources: [source], visitorId: "dashboard-preview" }),
      });
      const body = await response.json() as { answer?: string; conversationId?: string; source?: string; mode?: "test" | "live" };
      if (response.ok && body.answer?.trim()) {
        if (body.conversationId) setConversationId(body.conversationId);
        const answer = body.answer.trim();
        setMessages((items) => [...items, {
          id: Date.now() + 1,
          role: "assistant",
          content: answer,
          source: body.source ?? source?.name,
        }]);
        if (body.mode === "test") notify("Gemini is unavailable, so free Test AI answered through /api/chat.");
      } else {
        appendTest(question, source);
        notify("Live AI is unavailable, so Helpwise used Test AI.");
      }
    } catch {
      appendTest(question, source);
      notify("Test AI answered because the live connection is unavailable.");
    } finally {
      setIsAnswering(false);
    }
  };
  return { askBot, isAnswering, messages, resetChat };
}
