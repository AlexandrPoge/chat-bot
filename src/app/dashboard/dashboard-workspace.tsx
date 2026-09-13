"use client";

/* Full reload after logout clears the demo's in-memory workspace state. */
/* eslint-disable @next/next/no-location-assign-relative-destination */

import { useCallback, useRef, useState } from "react";
import { clearDemoSession } from "@/lib/auth-session";
import { DEFAULT_BOT_SETTINGS } from "@/lib/bot-settings";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { ConversationsPage } from "@/features/dashboard/components/conversations-page";
import { KnowledgePage } from "@/features/dashboard/components/knowledge-page";
import { OverviewPage } from "@/features/dashboard/components/overview-page";
import { PlanDialog } from "@/features/dashboard/components/plan-dialog";
import { SettingsEditor } from "@/features/dashboard/components/settings-editor";
import { TestCheckout } from "@/features/dashboard/components/test-checkout";
import { WidgetPage } from "@/features/dashboard/components/widget-page";
import { useDemoSession } from "@/features/dashboard/hooks/use-browser-stores";
import { useDashboardBots } from "@/features/dashboard/hooks/use-dashboard-bots";
import { useDashboardChat } from "@/features/dashboard/hooks/use-dashboard-chat";
import { useDashboardKnowledge } from "@/features/dashboard/hooks/use-dashboard-knowledge";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";
import type { Plan, Section } from "@/features/dashboard/types";

export function DashboardWorkspace() {
  const [active, setActive] = useState<Section>("overview");
  const [choice, setChoice] = useState<Plan>("Pro");
  const [billingStep, setBillingStep] = useState<"plans" | "checkout" | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const session = useDemoSession();
  const notify = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); }, []);
  const bots = useDashboardBots(notify);
  const settings = bots.settings;
  const chat = useDashboardChat(notify);
  const stats = useDashboardStats(bots.activeId, chat.messages.length);
  const knowledge = useDashboardKnowledge({ botId: bots.activeId, notify, resetChat: chat.resetChat, saveSettings: (value) => { void bots.saveSettings(value); }, settings });
  const sourceAttribute = knowledge.activeDocument?.cloudId ? ` data-source="${knowledge.activeDocument.cloudId}"` : "";
  const embedCode = `<script async src="https://app.helpwise.ai/widget.js" data-bot="${bots.activeId}"${sourceAttribute}></script>`;
  const copyEmbedCode = async () => {
    await navigator.clipboard?.writeText(`<script async src="${window.location.origin}/widget.js" data-bot="${bots.activeId}"${sourceAttribute}></script>`);
    setCopied(true); notify("Embed code copied"); window.setTimeout(() => setCopied(false), 1800);
  };
  const activatePlan = () => {
    if (choice === "Starter") { void bots.savePlan("Starter"); setBillingStep(null); notify("Starter remains active."); return; }
    setBillingStep("checkout");
  };
  const content = active === "conversations" ? <ConversationsPage activeDocument={knowledge.activeDocument} isAnswering={chat.isAnswering} messages={chat.messages} onAsk={(question, mode) => chat.askBot(question, mode, knowledge.activeDocument)} settings={settings} />
    : active === "knowledge" ? <KnowledgePage activeDocument={knowledge.activeDocument} activeSourceId={knowledge.activeSourceId} documents={knowledge.documents} fileInput={fileInput} onAddFiles={knowledge.addFiles} onChoose={knowledge.chooseSource} onRemove={knowledge.removeSource} />
    : active === "widget" ? <WidgetPage activeDocument={knowledge.activeDocument} code={embedCode} copied={copied} onCopy={copyEmbedCode} />
      : active === "settings" ? <SettingsEditor documentCount={knowledge.documents.length} key={JSON.stringify(settings)} onReset={() => { void bots.saveSettings(DEFAULT_BOT_SETTINGS); notify("Default settings restored."); }} onSave={(value) => { void bots.saveSettings(value); notify("Settings saved to Supabase and widget updated."); }} onUpgrade={() => setBillingStep("plans")} plan={bots.plan} settings={settings} />
        : <OverviewPage activeDocument={knowledge.activeDocument} documents={knowledge.documents} isAnswering={chat.isAnswering} messages={chat.messages} onAsk={(question, mode) => chat.askBot(question, mode, knowledge.activeDocument)} onGoTo={setActive} settings={settings} stats={stats} userName={session?.email.split("@")[0] || ""} />;
  return <><DashboardShell active={active} activeBotId={bots.activeId} bots={bots.bots} onBotCreate={() => { void bots.add(); }} onBotSelect={(id) => { bots.select(id); chat.resetChat(); }} onGoTo={setActive} onLogout={() => { clearDemoSession(); window.location.assign("/"); }} onProfileToggle={() => setProfileOpen((value) => !value)} onUpgrade={() => setBillingStep("plans")} plan={bots.plan} profileOpen={profileOpen} session={session} toast={toast}>{content}</DashboardShell>{billingStep === "plans" && <PlanDialog choice={choice} onChoose={setChoice} onClose={() => setBillingStep(null)} onContinue={activatePlan} />}{billingStep === "checkout" && <TestCheckout onClose={() => setBillingStep("plans")} onPaid={() => { void bots.savePlan("Pro"); setBillingStep(null); notify("Pro is active. This was a test payment — no card was charged."); }} />}</>;
}
