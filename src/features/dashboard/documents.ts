import { profileFromDocument } from "@/lib/bot-settings";
import type { KnowledgeSource } from "@/lib/test-assistant";
import type { CloudDocument, DashboardDocument } from "./types";

export function documentType(name: string): DashboardDocument["type"] {
  const extension = name.split(".").pop()?.toUpperCase();
  return extension === "PDF" || extension === "DOCX" || extension === "TXT" ? extension : "MD";
}

export function documentFromSnapshot(source: KnowledgeSource & { id: number }): DashboardDocument {
  return {
    ...source,
    cloudStatus: source.cloudId ? "Synced" : undefined,
    type: documentType(source.name),
    size: "Saved source",
    status: "Ready",
    profile: profileFromDocument(source.name, source.summary),
  };
}

function idFromCloud(value: string) {
  return [...value].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);
}

export function cloudDocumentFromRecord(record: CloudDocument): DashboardDocument {
  return {
    id: Math.abs(idFromCloud(record.id)) + 10_000,
    cloudId: record.id,
    cloudStatus: "Synced",
    name: record.filename,
    type: documentType(record.filename),
    size: `${Math.max(1, Math.round(record.byte_size / 1024))} KB · Supabase`,
    status: record.processing_status === "ready" ? "Ready" : record.processing_status === "failed" ? "Failed" : "Indexing",
    summary: record.extracted_text || "This source is stored in Supabase and is still being indexed.",
    profile: profileFromDocument(record.filename, record.extracted_text || ""),
  };
}

export function documentFromFile(file: File, id: number): DashboardDocument {
  return {
    id,
    name: file.name,
    type: documentType(file.name),
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    status: "Indexing",
    summary: "Waiting for secure server extraction…",
    cloudStatus: "Uploading",
  };
}
