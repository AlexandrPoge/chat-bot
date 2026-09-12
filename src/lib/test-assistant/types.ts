export type KnowledgeSource = {
  cloudId?: string;
  name: string;
  summary: string;
};

export type TestAnswer = {
  content: string;
  source: string;
  followUp?: string;
};
