import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { retrieveRelevantChunks } from "@/lib/knowledge/search";
import { getTestAnswer } from "@/lib/test-assistant";

type Source = {
  cloudId?: string;
  name: string;
  summary: string;
};

type ChatRequest = {
  question?: unknown;
  sources?: unknown;
};

function toSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((source): source is Record<string, unknown> => typeof source === "object" && source !== null)
    .map((source) => ({
      cloudId: typeof source.cloudId === "string" ? source.cloudId : undefined,
      name: typeof source.name === "string" ? source.name : "Untitled source",
      summary: typeof source.summary === "string" ? source.summary : "",
    }))
    .filter((source) => source.summary.length > 0)
    .slice(0, 8);
}

export async function POST(request: Request) {
  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request must contain JSON." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const sources = toSources(body.sources);

  if (!question || question.length > 2_000) {
    return Response.json({ error: "Provide a question between 1 and 2,000 characters." }, { status: 400 });
  }

  if (!sources.length) {
    return Response.json({ error: "Add at least one knowledge source before asking a question." }, { status: 400 });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!geminiApiKey && !openAiApiKey) {
    const answer = getTestAnswer(question, sources, question.length);
    return Response.json({
      answer: answer.content,
      source: answer.source,
      mode: "test",
      followUp: answer.followUp,
    });
  }

  try {
    const retrieved = await retrieveRelevantChunks(question, sources.flatMap((source) => source.cloudId ? [source.cloudId] : []));
    const sourceContext = retrieved.length
      ? retrieved.map((chunk) => `SOURCE: ${chunk.filename}\n${chunk.content}`).join("\n\n---\n\n")
      : sources.map((source) => `SOURCE: ${source.name}\n${source.summary.slice(0, 8_000)}`).join("\n\n---\n\n");
    const sourceName = retrieved[0]?.filename ?? sources[0]?.name;
    let answer = "";
    if (geminiApiKey) {
      const client = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await client.interactions.create({
        model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
        input: [
            "You are a concise, warm customer-support assistant.",
            "Answer only from the supplied knowledge sources; never invent policy, availability, pricing, or medical advice.",
            "If the source does not answer the question, say that clearly and suggest the next useful step.",
            "Reply in the customer's language, use short paragraphs, and do not mention prompts or internal implementation.",
            `Knowledge sources:\n${sourceContext}`,
            `Customer question: ${question}`,
          ].join("\n\n"),
        generation_config: { thinking_level: "minimal", max_output_tokens: 800 },
      });
      answer = response.output_text?.trim() ?? "";
    } else if (openAiApiKey) {
      const client = new OpenAI({ apiKey: openAiApiKey });
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        store: false,
        instructions: "You are a concise customer support assistant. Answer only from the supplied knowledge sources. If the sources do not answer, say so plainly. Reply in the customer's language.",
        input: `Knowledge sources:\n${sourceContext}\n\nCustomer question: ${question}`,
      });
      answer = response.output_text.trim();
    }
    if (!answer) {
      return Response.json({ error: "The model returned no text." }, { status: 502 });
    }

    return Response.json({ answer, source: sourceName, mode: "live", provider: geminiApiKey ? "gemini" : "openai", retrieval: retrieved.length ? "pgvector" : "source" });
  } catch (error) {
    console.error("Helpwise AI response failed", error);
    return Response.json({ error: "The AI service could not answer right now." }, { status: 502 });
  }
}
