import { Plus } from "lucide-react";
import type { CloudBot } from "../types";

type Props = {
  activeId: string;
  bots: CloudBot[];
  onCreate: () => void;
  onSelect: (id: string) => void;
};

export function BotSwitcher({ activeId, bots, onCreate, onSelect }: Props) {
  return <div className="flex min-w-0 items-center gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Active bot</span><select aria-label="Active bot" className="h-9 w-full min-w-0 rounded-lg border border-[#dce5d8] bg-white px-2 text-xs font-bold text-[#526050] outline-none transition focus:border-[#8bb660]" disabled={!bots.length} onChange={(event) => onSelect(event.target.value)} value={activeId}>{bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.name}</option>)}</select></label><button aria-label="Create another bot" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dce5d8] bg-white text-[#65903e] transition hover:-translate-y-px hover:bg-[#eff8e8]" onClick={onCreate} title="Create another bot" type="button"><Plus size={15} /></button></div>;
}
