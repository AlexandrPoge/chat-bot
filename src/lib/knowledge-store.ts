export type StoredKnowledgeSource = {
  cloudId?: string;
  id: number;
  name: string;
  summary: string;
};

export type KnowledgeSnapshot = {
  activeSourceId: number;
  sources: StoredKnowledgeSource[];
};

export const KNOWLEDGE_STORAGE_KEY = "helpwise-knowledge";
export const KNOWLEDGE_CHANGE_EVENT = "helpwise:knowledge-change";

export const DEFAULT_KNOWLEDGE_SOURCES: StoredKnowledgeSource[] = [
  {
    id: 1,
    name: "Team collaboration guide.pdf",
    summary: "Project guests can view deliverables and comment. Owners invite guests from the Share menu.",
  },
  {
    id: 2,
    name: "Billing & plans.md",
    summary: "Pro includes custom colors, domain allowlists, unlimited sources, and no Helpwise branding.",
  },
  {
    id: 3,
    name: "Product onboarding.docx",
    summary: "New accounts create a workspace, connect a product, and invite teammates during onboarding.",
  },
];

export const DEFAULT_KNOWLEDGE_SNAPSHOT: KnowledgeSnapshot = {
  activeSourceId: DEFAULT_KNOWLEDGE_SOURCES[0].id,
  sources: DEFAULT_KNOWLEDGE_SOURCES,
};

function isKnowledgeSource(value: unknown): value is StoredKnowledgeSource {
  if (!value || typeof value !== "object") return false;
  const source = value as StoredKnowledgeSource;
  return typeof source.id === "number" && typeof source.name === "string" && typeof source.summary === "string";
}

function isKnowledgeSnapshot(value: unknown): value is KnowledgeSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as KnowledgeSnapshot;
  return typeof snapshot.activeSourceId === "number" && Array.isArray(snapshot.sources) && snapshot.sources.every(isKnowledgeSource);
}

export function readKnowledgeSnapshot(): KnowledgeSnapshot {
  if (typeof window === "undefined") return DEFAULT_KNOWLEDGE_SNAPSHOT;

  try {
    const saved = window.localStorage.getItem(KNOWLEDGE_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    if (!isKnowledgeSnapshot(parsed) || parsed.sources.length === 0) return DEFAULT_KNOWLEDGE_SNAPSHOT;
    const activeSourceId = parsed.sources.some((source) => source.id === parsed.activeSourceId)
      ? parsed.activeSourceId
      : parsed.sources[0].id;
    return { sources: parsed.sources, activeSourceId };
  } catch {
    return DEFAULT_KNOWLEDGE_SNAPSHOT;
  }
}

export function writeKnowledgeSnapshot(snapshot: KnowledgeSnapshot) {
  const safeSnapshot = {
    activeSourceId: snapshot.sources.some((source) => source.id === snapshot.activeSourceId)
      ? snapshot.activeSourceId
      : snapshot.sources[0]?.id ?? 0,
    sources: snapshot.sources.map(({ cloudId, id, name, summary }) => ({ cloudId, id, name, summary })),
  };
  window.localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify(safeSnapshot));
  window.dispatchEvent(new Event(KNOWLEDGE_CHANGE_EVENT));
}

export function knowledgeSnapshot() {
  return JSON.stringify(readKnowledgeSnapshot());
}

export const defaultKnowledgeSnapshot = JSON.stringify(DEFAULT_KNOWLEDGE_SNAPSHOT);
