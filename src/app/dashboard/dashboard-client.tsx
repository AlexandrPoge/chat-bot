"use client";

/* Full reload after logout clears the demo's in-memory workspace state. */
/* eslint-disable @next/next/no-location-assign-relative-destination */

import { useRef, useState } from "react";
import { clearDemoSession } from "@/lib/auth-session";
import { DEFAULT_BOT_SETTINGS, writeBotSettings } from "@/lib/bot-settings";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { ConversationsPage } from "@/features/dashboard/components/conversations-page";
import { KnowledgePage } from "@/features/dashboard/components/knowledge-page";
import { OverviewPage } from "@/features/dashboard/components/overview-page";
import { PlanDialog } from "@/features/dashboard/components/plan-dialog";
import { SettingsEditor } from "@/features/dashboard/components/settings-editor";
import { TestCheckout } from "@/features/dashboard/components/test-checkout";
import { WidgetPage } from "@/features/dashboard/components/widget-page";
import { useDemoSession, useSavedSettings } from "@/features/dashboard/hooks/use-browser-stores";
import { useDashboardChat } from "@/features/dashboard/hooks/use-dashboard-chat";
import { useDashboardKnowledge } from "@/features/dashboard/hooks/use-dashboard-knowledge";
import type { Plan, Section } from "@/features/dashboard/types";

export default function DashboardClient() {
  const [active, setActive] = useState<Section>("overview");
  const [plan, setPlan] = useState<Plan>("Starter");
  const [choice, setChoice] = useState<Plan>("Pro");
  const [billingStep, setBillingStep] = useState<"plans" | "checkout" | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const settings = useSavedSettings();
  const session = useDemoSession();
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };
  const chat = useDashboardChat(notify);
  const knowledge = useDashboardKnowledge({
    notify,
    resetChat: chat.resetChat,
    saveSettings: writeBotSettings,
    settings,
  });
  const origin = typeof window === "undefined" ? "https://app.helpwise.ai" : window.location.origin;
  const embedCode = `<script async src="${origin}/widget.js" data-bot="orbit_7Q92"></script>`;
  const goTo = (section: Section) => setActive(section);
  const copyEmbedCode = async () => {
    await navigator.clipboard?.writeText(embedCode);
    setCopied(true);
    notify("Embed code copied");
    window.setTimeout(() => setCopied(false), 1800);
  };
  const activatePlan = () => {
    if (choice === "Starter") {
      setPlan("Starter");
      setBillingStep(null);
      notify("Starter remains active.");
      return;
    }
    setBillingStep("checkout");
  };
  const content = active === "conversations" ? <ConversationsPage activeDocument={knowledge.activeDocument} isAnswering={chat.isAnswering} messages={chat.messages} onAsk={(question, mode) => chat.askBot(question, mode, knowledge.activeDocument)} settings={settings} />
    : active === "knowledge" ? <KnowledgePage activeDocument={knowledge.activeDocument} activeSourceId={knowledge.activeSourceId} documents={knowledge.documents} fileInput={fileInput} onAddFiles={knowledge.addFiles} onChoose={knowledge.chooseSource} onRemove={knowledge.removeSource} />
    : active === "widget" ? <WidgetPage activeDocument={knowledge.activeDocument} code={embedCode} copied={copied} onCopy={copyEmbedCode} />
      : active === "settings" ? <SettingsEditor documentCount={knowledge.documents.length} key={JSON.stringify(settings)} onReset={() => { writeBotSettings(DEFAULT_BOT_SETTINGS); notify("Default settings restored."); }} onSave={(value) => { writeBotSettings(value); notify("Settings saved and widget updated."); }} onUpgrade={() => setBillingStep("plans")} plan={plan} settings={settings} />
        : <OverviewPage activeDocument={knowledge.activeDocument} documents={knowledge.documents} isAnswering={chat.isAnswering} messages={chat.messages} onAsk={(question, mode) => chat.askBot(question, mode, knowledge.activeDocument)} onGoTo={goTo} settings={settings} userName={session?.email.split("@")[0] || "Alex"} />;
  return <><DashboardShell active={active} onGoTo={goTo} onLogout={() => { clearDemoSession(); window.location.assign("/"); }} onProfileToggle={() => setProfileOpen((value) => !value)} onUpgrade={() => setBillingStep("plans")} plan={plan} profileOpen={profileOpen} session={session} toast={toast}>{content}</DashboardShell>{billingStep === "plans" && <PlanDialog choice={choice} onChoose={setChoice} onClose={() => setBillingStep(null)} onContinue={activatePlan} />}{billingStep === "checkout" && <TestCheckout onClose={() => setBillingStep("plans")} onPaid={() => { setPlan("Pro"); setBillingStep(null); notify("Pro is active. This was a test payment — no card was charged."); }} />}</>;
}
