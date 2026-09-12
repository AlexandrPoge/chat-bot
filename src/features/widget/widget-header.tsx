import Image from "next/image";
import type { BotSettings } from "@/lib/bot-settings";
import type { WidgetMode } from "./types";

type Props = {
  mode: WidgetMode;
  settings: BotSettings;
  onModeChange: (mode: WidgetMode) => void;
};

export function WidgetHeader({ mode, settings, onModeChange }: Props) {
  return <header className="flex shrink-0 items-center gap-3 bg-[#202823] px-3.5 py-3 text-white sm:px-4 sm:py-3.5"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl transition-transform duration-300 hover:scale-105" style={{ backgroundColor: settings.accent }}><Image alt={`${settings.name} mascot`} className="scale-[1.7] object-contain" height={40} priority src="/mascot/orbit-support-mascot.png" width={40} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{settings.name}</p><p className="mt-0.5 truncate text-[11px] text-[#b9c4b8]">Answers from your selected source</p></div><div className="ml-auto flex shrink-0 rounded-lg bg-white/10 p-0.5 text-[9px] font-bold"><button aria-pressed={mode === "test"} className={`rounded-md px-1.5 py-1 transition ${mode === "test" ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`} onClick={() => onModeChange("test")} type="button">Test</button><button aria-pressed={mode === "gemini"} className={`rounded-md px-1.5 py-1 transition ${mode === "gemini" ? "bg-[#d9fb97] text-[#405735]" : "text-white/55 hover:text-white"}`} onClick={() => onModeChange("gemini")} type="button">Gemini</button></div></header>;
}
