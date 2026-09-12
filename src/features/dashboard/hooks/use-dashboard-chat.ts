import { useState } from "react";
import { getTestAnswer } from "@/lib/test-assistant";
import type { DashboardDocument, ChatMessage, ChatMode } from "../types";

const welcome = "Hi — I’ll answer from the active document and show the source on every reply. What would you like to know?";

function firstMessage(document?: DashboardDocument): ChatMessage {
  return {
    id: 1,
    role: "assistant",
    content: document ? `I’m now using “${document.name}”. Ask a customer question and I’ll keep the answer clear and grounded.` : welcome,
    source: document?.name,
  };
}

export function useDashboardChat(notify: (message: string) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([firstMessage()]);
  const [isAnswering, setIsAnswering] = useState(false);
  const resetChat = (document?: DashboardDocument) => setMessages([firstMessage(document)]);
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
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sources: source ? [source] : [] }),
      });
      const body = await response.json() as { answer?: string; source?: string; mode?: "test" | "live" };
      if (response.ok && body.answer?.trim()) {
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
