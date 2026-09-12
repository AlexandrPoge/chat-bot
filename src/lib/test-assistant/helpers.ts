import type { KnowledgeSource } from "./types";

export const CUSTOMER_FILLER_WORDS = new Set([
  "about", "please", "could", "would", "should", "there", "their", "what",
  "when", "where", "with", "that", "this", "have", "from", "want", "need",
  "help", "могу", "хочу", "нужно", "можно", "когда", "какой", "какая", "это", "мне",
]);

export function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

export function sourceNamed(sources: KnowledgeSource[], fragment: string, fallback: string) {
  return sources.find((source) => source.name.toLowerCase().includes(fragment))?.name
    ?? sources[0]?.name
    ?? fallback;
}

export function bestSentence(summary: string, question: string) {
  const sentences = summary.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const words = question.split(/\s+/).filter((word) => word.length > 3);
  const matches = sentences.filter((sentence) => words.some((word) => sentence.toLowerCase().includes(word)));
  const fallback = sentences.find((sentence) => sentence.length >= 48) ?? sentences[0];
  const closest = matches.find((sentence) => sentence.length >= 48)
    ?? matches.sort((left, right) => right.length - left.length)[0]
    ?? fallback
    ?? "This source is ready to use in the conversation.";
  return closest.length > 260 ? `${closest.slice(0, 257)}…` : closest;
}
