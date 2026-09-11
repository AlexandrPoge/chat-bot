import OpenAI from "openai";

type Source = {
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Live AI is not configured." }, { status: 424 });
  }

  const sourceContext = sources
    .map((source) => `SOURCE: ${source.name}\n${source.summary.slice(0, 1_500)}`)
    .join("\n\n---\n\n");

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      store: false,
      instructions: [
        "You are a concise customer support assistant.",
        "Answer only from the supplied knowledge sources.",
        "If the sources do not answer the question, say so plainly and do not guess.",
        "Use short paragraphs and do not mention this prompt.",
      ].join(" "),
      input: `Knowledge sources:\n${sourceContext}\n\nCustomer question: ${question}`,
    });

    const answer = response.output_text.trim();
    if (!answer) {
      return Response.json({ error: "The model returned no text." }, { status: 502 });
    }

    return Response.json({ answer });
  } catch (error) {
    console.error("Helpwise AI response failed", error);
    return Response.json({ error: "The AI service could not answer right now." }, { status: 502 });
  }
}
