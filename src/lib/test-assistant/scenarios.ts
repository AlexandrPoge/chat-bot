import { includesAny, pick, sourceNamed } from "./helpers";
import type { KnowledgeSource, TestAnswer } from "./types";

function hasSource(sources: KnowledgeSource[], pattern: RegExp) {
  return sources.some((source) => pattern.test(`${source.name} ${source.summary}`));
}

function reply(content: string, source: string, followUp?: string): TestAnswer {
  return { content, source, followUp };
}

export function scenarioAnswer(question: string, sources: KnowledgeSource[], index: number): TestAnswer | undefined {
  const text = question.toLowerCase();
  const ru = /[а-яё]/i.test(question);
  if (includesAny(text, ["hello", "hi", "hey", "привет", "здравств"])) {
    const options = ru
      ? ["Привет! Задайте обычный вопрос клиента — отвечу кратко и укажу источник.", "Здравствуйте! Можно спросить про доступ, запуск команды или тарифы."]
      : ["Hi! Ask a normal customer question and I’ll keep the answer practical and grounded in a source.", "Hello! You can ask about access, onboarding, or plans."];
    return reply(pick(options, index), "Helpwise Test AI");
  }
  if (includesAny(text, ["thanks", "thank you", "спасибо"])) {
    return reply(ru ? "Пожалуйста! Можете задать следующий вопрос так, как его сформулировал бы клиент." : "You’re welcome! Try the next question exactly as a customer would ask it.", "Helpwise Test AI");
  }
  if (includesAny(text, ["invite", "client", "guest", "приглас", "клиент", "гост"]) && hasSource(sources, /collaboration|guest|deliverable|share/i)) {
    const content = ru
      ? "Откройте проект, нажмите Share, введите email клиента и назначьте роль Guest. Гость видит материалы и комментирует, но не меняет настройки и не видит биллинг."
      : "Open the project, choose Share, enter the client’s email, and assign the Guest role. Guests can view deliverables and comment, but cannot change settings or access billing.";
    return reply(content, sourceNamed(sources, "collaboration", "Team collaboration guide.pdf"), ru ? "Хотите проверить сценарий удаления доступа гостя?" : "Want to test removing guest access too?");
  }
  if (includesAny(text, ["plan", "billing", "pro", "price", "cost", "тариф", "биллинг", "цен", "оплат"]) && hasSource(sources, /billing|plan|starter|pro|pricing/i)) {
    const content = ru
      ? "Starter бесплатный: один бот и до 20 источников. Pro стоит $39 в месяц и добавляет до пяти ботов, неограниченные источники, свой бренд и виджет без брендинга."
      : "Starter is free for one bot and 20 sources. Pro is $39 per month with up to five bots, unlimited sources, custom branding, and no Helpwise badge.";
    return reply(content, sourceNamed(sources, "billing", "Billing & plans.md"), ru ? "Хотите сравнить Starter и Pro для своего сценария?" : "Want a quick Starter-versus-Pro comparison?");
  }
  if (includesAny(text, ["start", "onboard", "workspace", "setup", "начат", "настро", "ворксп"]) && hasSource(sources, /onboarding|workspace|member|setup/i)) {
    const content = ru
      ? "Создайте workspace, добавьте первый проект, пригласите коллег как Members, затем клиентов как Guests. Владелец сохраняет контроль над правами и биллингом."
      : "Create a workspace, add the first project, invite teammates as Members, then add clients as Guests. The owner keeps control of permissions and billing.";
    return reply(content, sourceNamed(sources, "onboarding", "Product onboarding.docx"), ru ? "Нужно объяснить разницу между Member и Guest?" : "Want a quick Member-versus-Guest explanation?");
  }
  if (includesAny(text, ["login", "password", "account", "access", "войти", "парол", "аккаунт", "доступ"]) && hasSource(sources, /account|password|login|access|invite/i)) {
    const content = ru
      ? "Используйте email из приглашения, затем попробуйте восстановление пароля. Если доступа всё ещё нет, владелец workspace может повторно отправить приглашение через Share."
      : "Use the email that received the invitation, then try password recovery. If access still fails, the workspace owner can resend an invite from Share.";
    return reply(content, "Helpwise Test AI");
  }
}
