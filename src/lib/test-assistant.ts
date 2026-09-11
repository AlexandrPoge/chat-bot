export type KnowledgeSource = {
  name: string;
  summary: string;
};

export type TestAnswer = {
  content: string;
  source: string;
  followUp?: string;
};

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

function sourceNamed(sources: KnowledgeSource[], fragment: string, fallback: string) {
  return sources.find((source) => source.name.toLowerCase().includes(fragment))?.name ?? fallback;
}

function sourceExcerpt(summary: string, question: string) {
  const text = summary.replace(/\s+/g, " ").trim();
  const keyword = question.split(/\s+/).find((word) => word.length > 3 && text.toLowerCase().includes(word));
  const position = keyword ? text.toLowerCase().indexOf(keyword) : 0;
  const start = Math.max(0, position - 180);
  const end = Math.min(text.length, position + 420);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export function getTestAnswer(
  question: string,
  sources: KnowledgeSource[],
  replyIndex = 0,
): TestAnswer {
  const normalized = question.toLowerCase().trim();
  const greeting = includesAny(normalized, ["hello", "hi", "hey", "привет", "здравств"]);
  const guestQuestion = includesAny(normalized, ["invite", "client", "guest", "приглас", "клиент", "гост"]);
  const billingQuestion = includesAny(normalized, ["plan", "billing", "pro", "price", "cost", "тариф", "биллинг", "цен", "оплат"]);
  const onboardingQuestion = includesAny(normalized, ["start", "onboard", "workspace", "setup", "начат", "настро", "ворксп"]);

  if (greeting) {
    const variations = [
      "Hi! I can help with client access, onboarding, or plans. What are you trying to do?",
      "Hello! I have your support knowledge ready. Ask about collaboration, workspace setup, or billing.",
      "Hey there! Tell me what you need, and I’ll point you to the relevant product guidance.",
    ];
    return { content: variations[replyIndex % variations.length], source: "Helpwise Test AI" };
  }

  if (guestQuestion) {
    return {
      content: "Yes. Open the project, select Share, enter the client’s email, and assign the Guest role. Guests can view deliverables and comment, but they cannot change settings, invite others, or access billing.",
      source: sourceNamed(sources, "collaboration", "Team collaboration guide.pdf"),
      followUp: "Want the steps for removing guest access too?",
    };
  }

  if (billingQuestion) {
    return {
      content: "Pro is $39 per month. It unlocks up to five active bots, unlimited knowledge sources, custom colors, approved-domain controls, and a widget without Helpwise branding. Starter remains free for one bot and 20 sources.",
      source: sourceNamed(sources, "billing", "Billing & plans.md"),
      followUp: "I can also compare a specific Starter limit with Pro.",
    };
  }

  if (onboardingQuestion) {
    return {
      content: "A smooth first setup is: create a workspace, create your first project, invite teammates as Members, then add clients as Guests. The project owner keeps responsibility for permissions and billing.",
      source: sourceNamed(sources, "onboarding", "Product onboarding.docx"),
      followUp: "Would you like a quick explanation of Member versus Guest access?",
    };
  }

  const matchingSource = sources.find((source) => {
    const haystack = `${source.name} ${source.summary}`.toLowerCase();
    return normalized.split(/\s+/).some((word) => word.length > 3 && haystack.includes(word));
  }) ?? sources[replyIndex % Math.max(sources.length, 1)];

  if (matchingSource) {
    return {
      content: `I found a relevant note in ${matchingSource.name}: ${sourceExcerpt(matchingSource.summary, normalized)} If you share a little more context, I can make the answer more specific.`,
      source: matchingSource.name,
    };
  }

  return {
    content: "I don’t have a matching source yet. Add a document that covers this topic, or ask about client collaboration, onboarding, or billing to try the free Test AI.",
    source: "Helpwise Test AI",
  };
}
