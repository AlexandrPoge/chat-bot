import { type ChangeEvent, useEffect, useState } from "react";
import { profileFromDocument, type BotSettings } from "@/lib/bot-settings";
import { cloudDocumentFromRecord, documentFromFile } from "../documents";
import { accessToken, deleteCloudDocument, fetchCloudDocuments, uploadDocuments, type UploadResult } from "../knowledge-api";
import type { DashboardDocument } from "../types";

type Options = {
  botId?: string;
  settings: BotSettings;
  notify: (message: string) => void;
  resetChat: (document?: DashboardDocument) => void;
  saveSettings: (settings: BotSettings) => Promise<boolean>;
};

function finishSync(items: DashboardDocument[], results: UploadResult[]) {
  return items.map((item) => {
    const result = results.find((candidate) => candidate.id === item.id);
    if (!result) return item;
    const size = item.size.replace(" · Supabase", "").replace(" · needs retry", "");
    return result.cloudId
      ? { ...item, status: "Ready" as const, size: `${size} · Supabase`, summary: result.summary ?? item.summary, profile: profileFromDocument(item.name, result.summary ?? ""), cloudStatus: "Synced" as const, cloudId: result.cloudId }
      : { ...item, status: "Ready" as const, size: `${size} · needs retry`, cloudStatus: "Failed" as const };
  });
}

export function useDashboardKnowledge(options: Options) {
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [activeSourceId, setActiveSourceId] = useState(0);
  const activeDocument = documents.find((item) => item.id === activeSourceId) ?? documents[0];

  useEffect(() => {
    if (!options.botId) return;
    let cancelled = false;
    void (async () => {
      try {
        await Promise.resolve();
        if (cancelled) return;
        setDocuments([]);
        setActiveSourceId(0);
        const token = await accessToken();
        if (!token || !options.botId) return;
        const cloud = await fetchCloudDocuments(token, options.botId);
        if (cancelled) return;
        const next = cloud.map(cloudDocumentFromRecord);
        setDocuments(next);
        setActiveSourceId(next[0]?.id ?? 0);
      } catch {
        // Local sources and Test AI remain usable when Supabase is temporarily unreachable.
      }
    })();
    return () => { cancelled = true; };
  }, [options.botId]);

  const chooseSource = async (document: DashboardDocument) => {
    setActiveSourceId(document.id);
    options.resetChat(document);
    const profile = document.profile;
    if (profile && Object.keys(profile).length) {
      const saved = await options.saveSettings({ ...options.settings, ...profile });
      if (saved) options.notify(`“${document.name}” is active. Bot name and greeting updated from the file.`);
      return;
    }
    options.notify(`Test AI now uses “${document.name}”.`);
  };
  const removeSource = async (id: number) => {
    const source = documents.find((document) => document.id === id);
    if (source?.cloudId) {
      const token = await accessToken();
      const error = token ? await deleteCloudDocument(source.cloudId, token, options.botId) : "Sign in again before removing this cloud source.";
      if (error) {
        options.notify(error);
        return;
      }
    }
    const remaining = documents.filter((document) => document.id !== id);
    setDocuments(remaining);
    if (id === activeSourceId) {
      setActiveSourceId(remaining[0]?.id ?? 0);
      options.resetChat(remaining[0]);
    }
    options.notify(source?.cloudId ? "Source removed from Supabase and this bot." : "Source removed");
  };
  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const additions = files.map((file, index) => documentFromFile(file, Date.now() + index));
    if (!additions.length) return;
    setDocuments((items) => [...additions, ...items]);
    setActiveSourceId(additions[0].id);
    options.resetChat(additions[0]);
    const token = await accessToken();
    if (!token) {
      setDocuments((items) => finishSync(items, additions.map((item) => ({ id: item.id, error: "No session" }))));
      options.notify("The source works in Test AI, but is not synced. Log out, log in to Supabase, then upload it again.");
      event.target.value = "";
      return;
    }
    const results = await uploadDocuments(files, additions, token, options.botId);
    setDocuments((items) => finishSync(items, results));
    const failed = results.filter((result) => result.error).length;
    const profiled = results.find((result) => result.cloudId && result.summary);
    const source = additions.find((item) => item.id === profiled?.id);
    const profile = source && profiled?.summary ? profileFromDocument(source.name, profiled.summary) : undefined;
    const profileApplied = profile ? await options.saveSettings({ ...options.settings, ...profile }) : false;
    const profileMessage = profileApplied ? " Bot name and greeting were created from the file." : "";
    options.notify(failed ? `${additions.length - failed} source(s) synced; ${failed} need a retry.${profileMessage}` : `${additions.length} source(s) securely stored in Supabase.${profileMessage}`);
    event.target.value = "";
  };
  return { activeDocument, activeSourceId, addFiles, chooseSource, documents, removeSource };
}
