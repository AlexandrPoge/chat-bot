import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CloudDocument, DashboardDocument } from "./types";

export async function accessToken() {
  const client = getSupabaseBrowserClient();
  const { data } = client ? await client.auth.getSession() : { data: { session: null } };
  return data.session?.access_token;
}

export async function fetchCloudDocuments(token: string): Promise<CloudDocument[]> {
  const response = await fetch("/api/knowledge", { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json() as { documents?: CloudDocument[] };
  return response.ok && body.documents ? body.documents : [];
}

type UploadResult = { id: number; cloudId?: string; error?: string };

export async function uploadDocuments(
  files: File[],
  documents: DashboardDocument[],
  token: string,
): Promise<UploadResult[]> {
  return Promise.all(documents.map(async (document, index) => {
    const form = new FormData();
    form.set("file", files[index]);
    form.set("extractedText", document.summary);
    try {
      const response = await fetch("/api/knowledge", {
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
