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
  return sources.find((source) => source.name.toLowerCase().includes(fragment))?.name ?? sources[0]?.name ?? fallback;
}

function bestSentence(summary: string, question: string) {
  const sentences = summary.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const words = question.split(/\s+/).filter((word) => word.length > 3);
  const matches = sentences.filter((sentence) => words.some((word) => sentence.toLowerCase().includes(word)));
  const closest = matches.find((sentence) => sentence.length >= 48) ?? matches.sort((left, right) => right.length - left.length)[0] ?? sentences.find((sentence) => sentence.length >= 48) ?? sentences[0] ?? "This source is ready to use in the conversation.";
  return closest.length > 260 ? `${closest.slice(0, 257)}…` : closest;
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

export function getTestAnswer(
  question: string,
  sources: KnowledgeSource[],
  replyIndex = 0,
): TestAnswer {
  const normalized = question.toLowerCase().trim();
  const inRussian = /[а-яё]/i.test(question);
  const greeting = includesAny(normalized, ["hello", "hi", "hey", "привет", "здравств"]);
  const thanks = includesAny(normalized, ["thanks", "thank you", "спасибо"]);
  const guestQuestion = includesAny(normalized, ["invite", "client", "guest", "приглас", "клиент", "гост"]);
  const billingQuestion = includesAny(normalized, ["plan", "billing", "pro", "price", "cost", "тариф", "биллинг", "цен", "оплат"]);
  const onboardingQuestion = includesAny(normalized, ["start", "onboard", "workspace", "setup", "начат", "настро", "ворксп"]);
  const accountQuestion = includesAny(normalized, ["login", "password", "account", "access", "войти", "парол", "аккаунт", "доступ"]);

  if (greeting) {
    const content = inRussian
      ? pick(["Привет! Я готов проверить сценарий как настоящий саппорт-бот. Что хочешь узнать: доступ клиентов, настройку рабочего пространства или тарифы?", "Здравствуйте! Я здесь, чтобы помочь по документам Orbit. Задайте обычный вопрос — отвечу кратко и укажу источник.", "Привет! Давайте протестируем чат по-настоящему: спросите про гостей, оплату или запуск команды."], replyIndex)
      : pick(["Hi! I’m ready to test this like a real support chat. What would you like to solve: client access, workspace setup, or billing?", "Hello! Ask a normal customer question and I’ll keep the answer practical, concise, and grounded in a source.", "Hey! Let’s test a real scenario. You can ask about guests, plans, or onboarding."], replyIndex);
    return { content, source: "Helpwise Test AI" };
  }

  if (thanks) {
    return {
      content: inRussian ? pick(["Пожалуйста! Если хотите, могу помочь проверить ещё один сценарий из виджета.", "Рад помочь. Можно задать следующий вопрос так, как его сформулировал бы клиент."], replyIndex) : pick(["You’re welcome! Want to test one more customer scenario in the widget?", "Glad to help. Try the next question exactly as a customer would ask it."], replyIndex),
      source: "Helpwise Test AI",
    };
  }

  if (guestQuestion) {
    return {
      content: inRussian
        ? pick(["Да. Откройте проект, нажмите Share, введите email клиента и назначьте роль Guest. Гость видит материалы и может комментировать, но не меняет настройки, не приглашает людей и не видит биллинг.", "Клиента лучше добавить как Guest через Share. Это даёт ему доступ к материалам и комментариям, но сохраняет управление проектом и оплатой за владельцем."], replyIndex)
        : pick(["Yes. Open the project, choose Share, enter the client’s email, and assign the Guest role. Guests can view deliverables and comment, but they cannot change settings, invite others, or access billing.", "Add the client as a Guest from Share. They can review work and comment while the owner retains control over settings, invitations, and billing."], replyIndex),
      source: sourceNamed(sources, "collaboration", "Team collaboration guide.pdf"),
      followUp: inRussian ? "Хотите проверить сценарий удаления доступа гостя?" : "Want to test the steps for removing guest access too?",
    };
  }

  if (billingQuestion) {
    return {
      content: inRussian
        ? pick(["Pro стоит $39 в месяц. В нём доступны до пяти ботов, неограниченное число источников, собственные цвета, список разрешённых доменов и виджет без брендинга. Starter остаётся бесплатным: один бот и до 20 источников.", "Для старта достаточно Starter: один бот и 20 источников. Pro за $39/месяц нужен, когда важны несколько ботов, кастомный бренд и неограниченная база знаний."], replyIndex)
        : pick(["Pro is $39 per month. It includes up to five bots, unlimited sources, custom colors, approved-domain controls, and a widget without Helpwise branding. Starter stays free for one bot and 20 sources.", "Starter is enough for a first bot and 20 sources. Choose Pro at $39/month when you need multiple bots, custom branding, and unlimited knowledge."], replyIndex),
      source: sourceNamed(sources, "billing", "Billing & plans.md"),
      followUp: inRussian ? "Хотите, я коротко сравню Starter и Pro для вашего сценария?" : "Want a short Starter-versus-Pro comparison for your use case?",
    };
  }

  if (onboardingQuestion) {
    return {
      content: inRussian
        ? pick(["Лучший порядок запуска: создайте workspace, добавьте первый проект, пригласите коллег как Members, затем клиентов как Guests. Владелец сохраняет контроль над правами и биллингом.", "Начните с рабочего пространства и первого проекта. После этого добавьте команду как Members, а внешних клиентов — как Guests: так права доступа остаются понятными."], replyIndex)
        : pick(["A smooth setup is: create a workspace, create the first project, invite teammates as Members, then add clients as Guests. The owner keeps control of permissions and billing.", "Start with a workspace and first project. Add teammates as Members, then external clients as Guests so access stays clear and controlled."], replyIndex),
      source: sourceNamed(sources, "onboarding", "Product onboarding.docx"),
      followUp: inRussian ? "Нужно объяснить разницу между Member и Guest?" : "Would you like a quick Member-versus-Guest explanation?",
    };
  }

  if (accountQuestion) {
    return {
      content: inRussian ? pick(["Проверьте, что используете email приглашения, затем попробуйте восстановление пароля. Если доступа всё ещё нет, владелец workspace может повторно отправить приглашение через Share.", "Для доступа сначала используйте email из приглашения. Если вход не проходит, восстановите пароль; владелец workspace при необходимости отправит приглашение повторно."], replyIndex) : pick(["First, make sure you are using the email that received the invitation, then try password recovery. If access still fails, the workspace owner can resend an invite from Share.", "Use the invited email address first. If sign-in still fails, reset the password; the workspace owner can resend the invitation if needed."], replyIndex),
      source: "Helpwise Test AI",
      followUp: inRussian ? "Хотите проверить, какие права есть у этой роли?" : "Want to check what permissions this role has?",
    };
  }

  const matchingSource = sources.find((source) => {
    const haystack = `${source.name} ${source.summary}`.toLowerCase();
    return normalized.split(/\s+/).some((word) => word.length > 3 && haystack.includes(word));
  }) ?? sources[replyIndex % Math.max(sources.length, 1)];

  if (!matchingSource) {
    return {
      content: inRussian ? "Пока в базе нет источника по этой теме. Добавьте документ или спросите про доступ клиентов, запуск workspace либо тарифы — я отвечу в бесплатном Test AI." : "There is no source for that topic yet. Add a document, or ask about client access, workspace setup, or plans to try the free Test AI.",
      source: "Helpwise Test AI",
    };
  }

  const excerpt = bestSentence(matchingSource.summary, normalized);
  const templates = inRussian
    ? [
      `Проверил «${matchingSource.name}». Коротко: ${excerpt}`,
      `По этому вопросу ближе всего «${matchingSource.name}»: ${excerpt}`,
      `Вот практичный ответ из «${matchingSource.name}»: ${excerpt}`,
    ]
    : [
      `I checked “${matchingSource.name}”. The useful takeaway is: ${excerpt}`,
      `The closest source is “${matchingSource.name}”. In short: ${excerpt}`,
      `Here is the practical note from “${matchingSource.name}”: ${excerpt}`,
    ];

  return {
    content: pick(templates, replyIndex),
    source: matchingSource.name,
    followUp: inRussian ? "Если опишете ситуацию чуть точнее, я отвечу ещё конкретнее." : "Share one more detail and I’ll make the answer more specific.",
  };
}
