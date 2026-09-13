import type { KnowledgeSource, TestAnswer } from "./test-assistant/types";

export type { KnowledgeSource, TestAnswer } from "./test-assistant/types";

const STOP_WORDS = new Set([
  "about", "please", "could", "would", "should", "there", "their", "what", "when", "where", "with", "that", "this", "have", "from", "want", "need", "help",
  "могу", "хочу", "нужно", "можно", "когда", "какой", "какая", "это", "мне", "ваш", "ваша",
]);

function searchTerms(question: string) {
  return question.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter((word) => word.length > 3 && !STOP_WORDS.has(word)) ?? [];
}

function cleanSource(text: string) {
  return text
    .replace(/BOT_NAME:\s*.*?(?=WELCOME_MESSAGE:)/gi, "")
    .replace(/WELCOME_MESSAGE:\s*.*?(?=ACCENT_COLOR:)/gi, "")
    .replace(/ACCENT_COLOR:\s*#[0-9a-f]{6}/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentences(source: KnowledgeSource) {
  return cleanSource(source.summary).split(/(?<=[.!?])\s+/).filter((sentence) => sentence.length >= 16);
}

function matchScore(sentence: string, terms: string[]) {
  const text = sentence.toLowerCase();
  return terms.reduce((score, term) => score + (text.includes(term) || (term.length > 6 && text.includes(term.slice(0, -2))) ? 1 : 0), 0);
}

function bestMatch(question: string, sources: KnowledgeSource[]) {
  const terms = searchTerms(question);
  return sources.flatMap((source) => sentences(source).map((sentence) => ({ source, sentence, score: matchScore(sentence, terms) })))
    .sort((left, right) => right.score - left.score || left.sentence.length - right.sentence.length)[0];
}

function focusedExcerpt(sentence: string, question: string) {
  const terms = searchTerms(question);
  const words = sentence.split(/\s+/);
  const matchAt = words.findIndex((word) => terms.some((term) => word.toLowerCase().includes(term)));
  const focused = matchAt > 4 ? words.slice(matchAt - 3) : words;
  if (focused.length > 1 && /^\p{Lu}/u.test(focused[0]) && /^\p{Lu}/u.test(focused[1])) focused.shift();
  const text = focused.join(" ");
  return text.length > 320 ? `${text.slice(0, 317)}…` : text;
}

function smallTalk(question: string, sources: KnowledgeSource[]): TestAnswer | undefined {
  const russian = /[а-яё]/i.test(question);
  const source = sources[0]?.name ?? "Helpwise Test AI";
  if (/\b(hello|hi|hey)\b|привет|здравств/i.test(question)) {
    return { content: russian ? "Здравствуйте! Задайте вопрос по активному документу — отвечу только тем, что в нём указано." : "Hi! Ask about the active document and I’ll answer only with information it contains.", source };
  }
  if (/thank|спасибо/i.test(question)) return { content: russian ? "Пожалуйста! Я готов проверить следующий вопрос по документу." : "You’re welcome! I’m ready to check another question against the document.", source };
  return undefined;
}

export function getTestAnswer(question: string, sources: KnowledgeSource[], replyIndex = 0): TestAnswer {
  const conversational = smallTalk(question, sources);
  if (conversational) return conversational;
  const match = bestMatch(question, sources);
  const russian = /[а-яё]/i.test(question);
  if (!match || match.score === 0) {
    return { content: russian ? "В активном документе нет надёжного ответа на этот вопрос. Я не буду придумывать детали." : "The active document does not contain a reliable answer to that question, so I won’t invent details.", source: sources[0]?.name ?? "Helpwise Test AI" };
  }
  const excerpt = focusedExcerpt(match.sentence, question);
  const prefixes = russian ? ["Вот что указано в документе:", "Нашёл точную информацию:"] : ["Here’s what the document says:", "I found a direct answer:"];
  return { content: `${prefixes[replyIndex % prefixes.length]} ${excerpt}`, source: match.source.name };
}
