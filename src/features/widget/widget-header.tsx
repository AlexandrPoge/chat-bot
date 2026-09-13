"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";

type Props = { settings: BotSettings };

export function WidgetHeader({ settings }: Props) {
  const close = () => window.parent.postMessage({ type: "helpwise:close" }, "*");
  return <header className="flex shrink-0 items-center gap-3 bg-[#202823] px-3 py-2.5 text-white sm:px-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ backgroundColor: settings.accent }}><Image alt={`${settings.name} mascot`} className="scale-[1.7] object-contain" height={36} priority src="/mascot/orbit-support-mascot.png" width={36} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{settings.name}</p><p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-[#b9c4b8]"><i className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#a9dc75]" />Usually replies instantly</p></div><button aria-label="Minimize chat" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white" onClick={close} type="button"><X size={16} /></button></header>;
}
