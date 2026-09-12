import { BadgeCheck, Bot, Database, LayoutDashboard, MessageCircleMore, Settings2, Sparkles } from "lucide-react";
import type { NavigationItem, Plan, PlanFeature } from "./types";

export const navigation: NavigationItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "conversations", label: "Conversations", icon: MessageCircleMore },
  { id: "widget", label: "Widget", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export const planFeatures: Record<Plan, PlanFeature[]> = {
  Starter: [
    { label: "1 active bot", icon: Bot },
    { label: "20 knowledge sources", icon: Database },
    { label: "1,000 answers / month", icon: MessageCircleMore },
    { label: "Helpwise widget", icon: Sparkles },
  ],
  Pro: [
    { label: "Up to 5 active bots", icon: Bot },
    { label: "Unlimited knowledge sources", icon: Database },
    { label: "Custom colors and domains", icon: Settings2 },
    { label: "Remove Helpwise branding", icon: BadgeCheck },
  ],
};
