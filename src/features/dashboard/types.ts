import type { LucideIcon } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";
import type { KnowledgeSource } from "@/lib/test-assistant";

export type Section = "overview" | "knowledge" | "conversations" | "widget" | "settings";
export type Plan = "Starter" | "Pro";
export type ChatMode = "test" | "live";

export type DashboardDocument = KnowledgeSource & {
  id: number;
  type: "PDF" | "DOCX" | "TXT" | "MD";
  size: string;
  status: "Ready" | "Indexing";
  profile?: Partial<BotSettings>;
  cloudStatus?: "Uploading" | "Synced" | "Failed";
  cloudId?: string;
};

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
  followUp?: string;
};

export type NavigationItem = { id: Section; label: string; icon: LucideIcon };
export type PlanFeature = { label: string; icon: LucideIcon };

export type CloudDocument = {
  id: string;
  filename: string;
  byte_size: number;
  processing_status: string;
  extracted_text: string | null;
};

export type CloudBot = {
  id: string;
  name: string;
  welcome_message: string;
  accent_color: string;
  plan: Plan;
};

export type DashboardStats = {
  answers: number;
  conversations: number;
  groundedAnswers: number;
  sources: number;
};
