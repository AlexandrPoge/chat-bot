import { CloudOff, CloudUpload, ShieldCheck } from "lucide-react";
import type { DashboardDocument } from "../types";

const states = {
  Failed: { Icon: CloudOff, label: "Not synced", style: "bg-[#fff1ee] text-[#b55d50]" },
  Synced: { Icon: ShieldCheck, label: "Supabase synced", style: "bg-[#edf8e5] text-[#609437]" },
  Uploading: { Icon: CloudUpload, label: "Saving…", style: "bg-[#edf4ff] text-[#587eb5]" },
};

export function CloudSyncPill({ status }: { status?: DashboardDocument["cloudStatus"] }) {
  if (!status) return null;
  const { Icon, label, style } = states[status];
  return <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${style}`}><Icon size={11} />{label}</span>;
}
