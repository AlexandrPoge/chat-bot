import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CloudDocument, DashboardDocument } from "./types";

export async function accessToken() {
  const client = getSupabaseBrowserClient();
  const { data } = client ? await client.auth.getSession() : { data: { session: null } };
  return data.session?.access_token;
}

function knowledgePath(botId?: string, documentId?: string) {
  const query = new URLSearchParams();
  if (botId) query.set("botId", botId);
  if (documentId) query.set("id", documentId);
  return `/api/knowledge?${query}`;
}

export async function fetchCloudDocuments(token: string, botId?: string): Promise<CloudDocument[]> {
  const response = await fetch(knowledgePath(botId), { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json() as { documents?: CloudDocument[] };
  return response.ok && body.documents ? body.documents : [];
}

export async function deleteCloudDocument(id: string, token: string, botId?: string) {
  const response = await fetch(knowledgePath(botId, id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json() as { error?: string };
  return response.ok ? undefined : body.error ?? "Could not remove the cloud source.";
}

type UploadResult = { id: number; cloudId?: string; error?: string };

export async function uploadDocuments(
  files: File[],
  documents: DashboardDocument[],
  token: string,
  botId?: string,
): Promise<UploadResult[]> {
  return Promise.all(documents.map(async (document, index) => {
    const form = new FormData();
    form.set("file", files[index]);
    form.set("extractedText", document.summary);
    try {
      const response = await fetch(knowledgePath(botId), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await response.json() as { id?: string; error?: string };
      return response.ok && body.id
        ? { id: document.id, cloudId: body.id }
        : { id: document.id, error: body.error ?? "Cloud upload failed." };
    } catch {
      return { id: document.id, error: "Could not reach Supabase. Check the network and retry." };
    }
  }));
}
