import type { DashboardDocument } from "../types";

export function StatusPill({ status }: { status: DashboardDocument["status"] }) {
  const ready = status === "Ready";
  const color = ready ? "bg-[#edf8e5] text-[#609437]" : "bg-[#fff6de] text-[#9f6d1f]";
  const dot = ready ? "bg-[#77b346]" : "bg-[#e2a13a]";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${color}`}><i className={`h-1.5 w-1.5 rounded-full ${dot}`} />{status}</span>;
}
