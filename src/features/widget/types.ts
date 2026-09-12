export type WidgetMode = "gemini" | "test";

export type WidgetMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
  followUp?: string;
};
