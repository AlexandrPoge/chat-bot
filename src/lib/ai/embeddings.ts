import { GoogleGenAI } from "@google/genai";

const DIMENSIONS = 1536;
const MODEL = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

async function embed(texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !texts.length) return [];
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.embedContent({
    model: MODEL,
    contents: texts,
    config: { outputDimensionality: DIMENSIONS, taskType },
  });
  const values = response.embeddings?.map((item) => item.values ?? []) ?? [];
  if (values.length !== texts.length || values.some((item) => item.length !== DIMENSIONS)) {
    throw new Error("Gemini returned an unexpected embedding shape.");
  }
  return values;
}

export function embedKnowledgeChunks(chunks: string[]) {
  return embed(chunks, "RETRIEVAL_DOCUMENT");
}

export async function embedSearchQuery(question: string) {
  return (await embed([question], "RETRIEVAL_QUERY"))[0];
}
