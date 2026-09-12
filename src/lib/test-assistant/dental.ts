import { includesAny } from "./helpers";
import type { KnowledgeSource, TestAnswer } from "./types";

type Reply = { english: string; russian: string };

const replies: [string[], Reply][] = [
  [["emergency", "pain", "swelling", "knocked", "сильн", "боль", "отек", "отёк", "выбил"], {
    english: "For severe pain, swelling, or a knocked-out tooth, contact the clinic immediately — the guide treats these as urgent symptoms.",
    russian: "При сильной боли, отёке или выбитом зубе свяжитесь с клиникой сразу — в источнике это указано как неотложный случай.",
  }],
  [["appointment", "book", "visit", "запис", "прием", "приём"], {
    english: "You can request an appointment by phone or through the clinic website. Please arrive 10 minutes early with photo ID and any relevant medical information.",
    russian: "Записаться можно по телефону или через сайт клиники. На приём лучше прийти на 10 минут раньше с удостоверением личности и актуальной медицинской информацией.",
  }],
  [["clean", "hygiene", "чистк", "гигиен"], {
    english: "The guide says most patients benefit from a professional cleaning every six months; the dentist may recommend a different schedule for your oral health.",
    russian: "В памятке указано, что большинству пациентов полезна профессиональная чистка раз в шесть месяцев; стоматолог может предложить другой график.",
  }],
  [["whiten", "бел", "отбел"], {
    english: "Whitening can improve many natural teeth. The dentist first checks whether it is suitable and discusses the expected result with you.",
    russian: "Отбеливание может улучшить цвет многих натуральных зубов. Перед процедурой стоматолог проверит, подходит ли она вам.",
  }],
  [["first", "new patient", "перв", "впервые"], {
    english: "At a first visit, the team reviews your history, takes any needed X-rays, completes an examination, and explains a personalized treatment plan.",
    russian: "На первом визите команда изучит историю, при необходимости сделает рентген, проведёт осмотр и объяснит план лечения.",
  }],
  [["repair", "teeth", "tooth", "filling", "crown", "леч", "зуб", "пломб", "корон"], {
    english: "DentalCare offers fillings and crowns. A consultation is the best first step: the dentist can assess the tooth and recommend the right treatment.",
    russian: "DentalCare помогает с пломбами и коронками. Первый шаг — консультация: стоматолог осмотрит зуб и предложит лечение.",
  }],
];

export function isDentalQuestion(question: string, sources: KnowledgeSource[]) {
  const source = sources.find((item) => /dental|dentist|teeth|tooth|clinic|стомат|зуб/i.test(`${item.name} ${item.summary}`));
  return source && includesAny(question.toLowerCase(), replies.flatMap(([terms]) => terms)) ? source : undefined;
}

export function dentalAnswer(question: string, source: KnowledgeSource, inRussian: boolean): TestAnswer {
  const match = replies.find(([terms]) => includesAny(question.toLowerCase(), terms));
  const reply = match?.[1] ?? {
    english: "I can help with appointments, first visits, cleanings, whitening, fillings, crowns, and urgent cases. Tell me what you would like to arrange.",
    russian: "Я могу помочь с записью, первым визитом, чисткой, отбеливанием, пломбами, коронками и неотложными случаями.",
  };
  return { content: inRussian ? reply.russian : reply.english, source: source.name };
}
