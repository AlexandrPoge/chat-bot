import { type ChangeEvent, type RefObject } from "react";
import { CircleHelp, FileText, UploadCloud } from "lucide-react";
import { KnowledgeRow } from "./knowledge-row";
import type { DashboardDocument } from "../types";

type Props = {
  activeDocument?: DashboardDocument;
  activeSourceId: number;
  documents: DashboardDocument[];
  fileInput: RefObject<HTMLInputElement | null>;
  onAddFiles: (event: ChangeEvent<HTMLInputElement>) => void;
  onChoose: (document: DashboardDocument) => void;
  onRemove: (id: number) => void;
};

export function KnowledgePage(props: Props) {
  const { activeDocument, activeSourceId, documents, fileInput, onAddFiles, onChoose, onRemove } = props;
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#73806e]">Source of truth</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Knowledge base</h1><p className="mt-2 text-sm text-[#7d877c]">Upload the product knowledge your bot should use when it answers.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#354238]" onClick={() => fileInput.current?.click()} type="button"><UploadCloud size={16} />Add sources</button><input accept=".pdf,.docx,.txt,.md" className="hidden" multiple onChange={onAddFiles} ref={fileInput} type="file" /></div>
    <div className="mt-5 rounded-2xl border border-[#dbe6d5] bg-[#f2f8ed] p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#638d38]"><FileText size={17} /></span><div><p className="text-sm font-bold text-[#4b6045]">Test chat is currently grounded in: <span className="text-[#2f5d1e]">{activeDocument?.name ?? "No source"}</span></p><p className="mt-1 text-xs leading-5 text-[#6b7d67]">A file name automatically creates the bot name and greeting. Use BOT_NAME, WELCOME_MESSAGE, or ACCENT_COLOR inside the file when you want to override them.</p></div></div></div>
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#e0e6dc] bg-white"><div className="flex justify-between border-b border-[#e8ece5] px-5 py-4"><p className="text-sm font-bold">{documents.length} sources</p><p className="text-xs text-[#8c968b]">PDF, DOCX, TXT, Markdown</p></div><div className="divide-y divide-[#edf0eb]">{documents.map((document) => <KnowledgeRow document={document} key={document.id} onChoose={onChoose} onRemove={onRemove} selected={document.id === activeSourceId} />)}</div></div>
    <div className="mt-4 flex gap-3 rounded-xl border border-dashed border-[#cfd9c9] bg-[#f7faf4] p-5 text-sm leading-6 text-[#61715d]"><CircleHelp className="mt-0.5 shrink-0 text-[#759e4c]" size={18} /><p><b>How document chat works.</b> The secure server validates and reads the file, stores it privately in Supabase, then indexes its text for retrieval. Test AI and Gemini use the selected source. A green “Supabase synced” label confirms both storage and indexing succeeded.</p></div>
  </div>;
}
