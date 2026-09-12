import { dentalAnswer, isDentalQuestion } from "./test-assistant/dental";
import { bestSentence, CUSTOMER_FILLER_WORDS, pick } from "./test-assistant/helpers";
import { scenarioAnswer } from "./test-assistant/scenarios";
import type { KnowledgeSource, TestAnswer } from "./test-assistant/types";

export type { KnowledgeSource, TestAnswer } from "./test-assistant/types";

function matchingSource(question: string, sources: KnowledgeSource[]) {
  const words = question.split(/\s+/).filter((word) => word.length > 3 && !CUSTOMER_FILLER_WORDS.has(word));
  return sources.find((source) => {
    const haystack = `${source.name} ${source.summary}`.toLowerCase();
    return words.some((word) => haystack.includes(word));
  });
}

function genericAnswer(question: string, sources: KnowledgeSource[], index: number): TestAnswer {
  const source = matchingSource(question.toLowerCase(), sources);
  const inRussian = /[а-яё]/i.test(question);
  if (!source) {
    const name = sources[0]?.name ?? (inRussian ? "этом документе" : "the active source");
    const content = inRussian
      ? `В активном источнике «${name}» нет точного ответа. Добавьте документ по нужной теме или переключите источник — я не буду придумывать ответ.`
      : `I can’t find a reliable answer in “${name}”. Switch to a relevant source or add one — I won’t invent an answer.`;
    return { content, source: sources[0]?.name ?? "Helpwise Test AI" };
  }
  const excerpt = bestSentence(source.summary, question.toLowerCase());
  const options = inRussian
    ? [`Проверил «${source.name}». Коротко: ${excerpt}`, `Вот практичный ответ из «${source.name}»: ${excerpt}`]
    : [`I checked “${source.name}”. The useful takeaway is: ${excerpt}`, `Here is the practical note from “${source.name}”: ${excerpt}`];
  return { content: pick(options, index), source: source.name };
}

export function getTestAnswer(question: string, sources: KnowledgeSource[], replyIndex = 0): TestAnswer {
  const dentalSource = isDentalQuestion(question, sources);
  if (dentalSource) return dentalAnswer(question, dentalSource, /[а-яё]/i.test(question));
  return scenarioAnswer(question, sources, replyIndex) ?? genericAnswer(question, sources, replyIndex);
}
