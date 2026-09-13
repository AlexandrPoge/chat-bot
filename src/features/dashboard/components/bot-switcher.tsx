import { Plus, Trash2 } from "lucide-react";
import type { CloudBot } from "../types";

type Props = {
  activeId: string;
  bots: CloudBot[];
  compact?: boolean;
  onCreate: () => void;
  onDelete: () => void;
  onSelect: (id: string) => void;
};

export function BotSwitcher({ activeId, bots, compact = false, onCreate, onDelete, onSelect }: Props) {
  const canDelete = bots.length > 1;
  return <div className={`min-w-0 ${compact ? "flex items-center gap-2" : "grid gap-2"}`}><label className="min-w-0 flex-1"><span className="sr-only">Active bot</span><select aria-label="Active bot" className="h-10 w-full min-w-0 rounded-xl border border-[#dce5d8] bg-white px-3 text-xs font-bold text-[#526050] outline-none transition hover:border-[#b9ccb0] focus:border-[#8bb660] focus:ring-2 focus:ring-[#dff1d1]" disabled={!bots.length} onChange={(event) => onSelect(event.target.value)} value={activeId}>{bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.name}</option>)}</select></label><div className={`flex shrink-0 gap-2 ${compact ? "" : "w-full"}`}><button aria-label="Create a new bot" className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#cfe0c7] bg-white font-bold text-[#5f873d] transition hover:-translate-y-px hover:bg-[#eff8e8] ${compact ? "px-3 text-xs" : "flex-1 px-3 text-xs"}`} onClick={onCreate} type="button"><Plus size={15} /><span>{compact ? "New" : "New bot"}</span></button>{canDelete && <button aria-label="Delete active bot" className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#ead5d1] bg-white font-bold text-[#a65f58] transition hover:-translate-y-px hover:bg-[#fff1ef] ${compact ? "w-10" : "flex-1 px-3 text-xs"}`} onClick={onDelete} title={compact ? "Delete active bot" : undefined} type="button"><Trash2 size={14} />{!compact && <span>Delete</span>}</button>}</div></div>;
}
