import Image from "next/image";
import { Send } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";

export function BotPreview({ settings }: { settings: BotSettings }) {
  return (
    <div className="rounded-[1.25rem] border border-[#dde5da] bg-white p-4 shadow-[0_18px_34px_-26px_rgba(33,50,31,.45)]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl" style={{ backgroundColor: settings.accent }}>
          <Image alt="Support bot mascot" className="scale-[1.65] object-contain" height={40} priority src="/mascot/orbit-support-mascot.png" width={40} />
        </span>
        <div className="min-w-0"><p className="truncate text-xs font-bold text-[#354135]">{settings.name}</p><p className="mt-0.5 text-[10px] text-[#8c9689]">Usually replies instantly</p></div>
        <span className="ml-auto text-[#9aa49a]">×</span>
      </div>
      <p className="mt-5 rounded-xl bg-[#f3f6ef] p-3 text-xs leading-5 text-[#586458]">{settings.welcome}</p>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e1e7de] px-3 py-2.5 text-[11px] text-[#a3aba1]">
        Ask a question…
        <span className="ml-auto grid h-5 w-5 place-items-center rounded-md text-[#405535]" style={{ backgroundColor: settings.accent }}><Send size={11} /></span>
      </div>
      <p className="mt-3 text-center text-[9px] text-[#a4ada2]">Powered by Helpwise</p>
    </div>
  );
}
