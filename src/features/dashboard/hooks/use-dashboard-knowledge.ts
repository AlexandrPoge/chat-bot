import { type ChangeEvent, useEffect, useState } from "react";
import type { BotSettings } from "@/lib/bot-settings";
import { DEFAULT_KNOWLEDGE_SNAPSHOT, readKnowledgeSnapshot, writeKnowledgeSnapshot } from "@/lib/knowledge-store";
import { cloudDocumentFromRecord, documentFromFile, documentFromSnapshot } from "../documents";
import { accessToken, fetchCloudDocuments, uploadDocuments } from "../knowledge-api";
import type { DashboardDocument } from "../types";

type Options = {
  settings: BotSettings;
  notify: (message: string) => void;
  resetChat: (document?: DashboardDocument) => void;
  saveSettings: (settings: BotSettings) => void;
};

function finishSync(items: DashboardDocument[], results: { id: number; cloudId?: string; error?: string }[]) {
  return items.map((item) => {
    const result = results.find((candidate) => candidate.id === item.id);
    if (!result) return item;
    const size = item.size.replace(" · Supabase", "").replace(" · needs retry", "");
    return result.cloudId
      ? { ...item, status: "Ready" as const, size: `${size} · Supabase`, cloudStatus: "Synced" as const, cloudId: result.cloudId }
      : { ...item, status: "Ready" as const, size: `${size} · needs retry`, cloudStatus: "Failed" as const };
  });
}

export function useDashboardKnowledge(options: Options) {
  const [documents, setDocuments] = useState(() => DEFAULT_KNOWLEDGE_SNAPSHOT.sources.map(documentFromSnapshot));
  const [activeSourceId, setActiveSourceId] = useState(DEFAULT_KNOWLEDGE_SNAPSHOT.activeSourceId);
  const [restored, setRestored] = useState(false);
  const activeDocument = documents.find((item) => item.id === activeSourceId) ?? documents[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = readKnowledgeSnapshot();
      setDocuments(saved.sources.map(documentFromSnapshot));
      setActiveSourceId(saved.activeSourceId);
      setRestored(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!restored) return;
    writeKnowledgeSnapshot({ activeSourceId, sources: documents.map(({ id, name, summary }) => ({ id, name, summary })) });
  }, [activeSourceId, documents, restored]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const token = await accessToken();
        if (!token) return;
        const cloud = await fetchCloudDocuments(token);
        if (cancelled) return;
        const restored = cloud.map(cloudDocumentFromRecord);
        setDocuments((items) => [...restored.filter((source) => !items.some((item) => item.cloudId === source.cloudId || item.name === source.name)), ...items]);
      } catch {
        // Local sources and Test AI remain usable when Supabase is temporarily unreachable.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const chooseSource = (document: DashboardDocument) => {
    setActiveSourceId(document.id);
    options.resetChat(document);
    options.notify(`Test AI now uses “${document.name}”.`);
  };
  const removeSource = (id: number) => {
    const remaining = documents.filter((document) => document.id !== id);
    setDocuments(remaining);
    if (id === activeSourceId) {
      setActiveSourceId(remaining[0]?.id ?? 0);
      options.resetChat(remaining[0]);
    }
    options.notify("Source removed");
  };
  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const additions = await Promise.all(files.map((file, index) => documentFromFile(file, Date.now() + index)));
    if (!additions.length) return;
    setDocuments((items) => [...additions, ...items]);
    setActiveSourceId(additions[0].id);
    options.resetChat(additions[0]);
    const profile = additions.find((item) => Object.keys(item.profile ?? {}).length)?.profile;
    if (profile) options.saveSettings({ ...options.settings, ...profile });
    const token = await accessToken();
    if (!token) {
      setDocuments((items) => finishSync(items, additions.map((item) => ({ id: item.id, error: "No session" }))));
      options.notify("The source is ready for Test AI. Sign in to sync it securely to Supabase.");
      event.target.value = "";
      return;
    }
    const results = await uploadDocuments(files, additions, token);
    setDocuments((items) => finishSync(items, results));
    const failed = results.filter((result) => result.error).length;
    options.notify(failed ? `${additions.length - failed} source(s) synced; ${failed} need a retry.` : `${additions.length} source(s) securely stored in Supabase.`);
    event.target.value = "";
  };
  return { activeDocument, activeSourceId, addFiles, chooseSource, documents, removeSource };
}
