import { Check, FileText } from "lucide-react";
import { StatusPill } from "./status-pill";
import type { DashboardDocument } from "../types";

type Props = {
  document: DashboardDocument;
  selected: boolean;
  onChoose: (document: DashboardDocument) => void;
  onRemove: (id: number) => void;
};

export function KnowledgeRow({ document, selected, onChoose, onRemove }: Props) {
  const iconStyle = selected ? "border-[#b8d59e] bg-[#e8f8d9] text-[#4d7c2c]" : "border-[#e2eadf] bg-[#f4f8f1] text-[#729747]";
  return <article className={`grid gap-3 px-5 py-4 transition sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${selected ? "bg-[#f5faef]" : "hover:bg-[#fafcf8]"}`}>
    <div className="flex min-w-0 items-center gap-3"><span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${iconStyle}`}><FileText size={18} /><span className="absolute -bottom-2 rounded-full border border-[#d6e4cd] bg-white px-1.5 py-0.5 text-[8px] font-extrabold tracking-[.08em] text-[#668d3f]">{document.type}</span></span><div className="min-w-0"><div className="flex min-w-0 gap-2"><p className="truncate text-sm font-bold text-[#485348]">{document.name}</p>{selected && <span className="shrink-0 rounded-full bg-[#d9f2bf] px-2 py-0.5 text-[9px] font-extrabold text-[#4e792c]">ACTIVE</span>}</div><p className="mt-1 truncate text-xs text-[#939c92]">{document.size} · {document.summary}</p>{Object.keys(document.profile ?? {}).length > 0 && <p className="mt-1 text-[10px] font-bold text-[#6c9741]">Bot profile fields detected and applied</p>}</div></div>
    <div className="flex shrink-0 flex-wrap items-center gap-3"><StatusPill status={document.status} /><button className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition ${selected ? "border-[#b7d697] bg-white text-[#4c7830]" : "border-[#d9e2d5] text-[#647063] hover:bg-[#f4faef]"}`} onClick={() => onChoose(document)} type="button">{selected ? <><Check className="mr-1 inline" size={13} />Used in chat</> : "Use in chat"}</button><button className="whitespace-nowrap text-xs font-bold text-[#a1aaa0] hover:text-[#ca6359]" onClick={() => onRemove(document.id)} type="button">Remove</button></div>
  </article>;
}
