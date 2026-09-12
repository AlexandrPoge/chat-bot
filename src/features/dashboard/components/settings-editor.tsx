"use client";

import { useState } from "react";
import { BadgeCheck, Check, ChevronRight } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";
import { BotPreview } from "./bot-preview";
import type { Plan } from "../types";

const colors = ["#D9FB97", "#B8D8FF", "#F7CF9C", "#E9C8FF"];

type Props = {
  settings: BotSettings;
  plan: Plan;
  documentCount: number;
  onSave: (value: BotSettings) => void;
  onReset: () => void;
  onUpgrade: () => void;
};

export function SettingsEditor({ settings, plan, documentCount, onSave, onReset, onUpgrade }: Props) {
  const [draft, setDraft] = useState(settings);
  return <div><p className="text-sm font-medium text-[#73806e]">Make your bot yours</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Bot settings</h1><p className="mt-2 text-sm text-[#7d877c]">Save once — the embedded widget receives the same name, greeting, and color.</p>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="space-y-5 rounded-2xl border border-[#e0e6dc] bg-white p-5"><label className="block text-sm font-bold text-[#4a554b]">Bot name<input className="mt-2 w-full rounded-xl border border-[#dce3d8] px-3 py-2.5 text-sm outline-none focus:border-[#92ae70]" onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} value={draft.name} /></label><label className="block text-sm font-bold text-[#4a554b]">Welcome message<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#dce3d8] px-3 py-2.5 text-sm font-normal leading-6 outline-none focus:border-[#92ae70]" onChange={(event) => setDraft((value) => ({ ...value, welcome: event.target.value }))} value={draft.welcome} /></label><div><p className="text-sm font-bold text-[#4a554b]">Accent color</p><div className="mt-3 flex flex-wrap gap-3">{colors.map((color) => <button aria-label={`Set ${color} as accent color`} aria-pressed={draft.accent === color} className={`relative grid h-11 w-11 place-items-center rounded-full ring-offset-2 transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none ${draft.accent === color ? "ring-2 ring-[#4d7136]" : ""}`} key={color} onClick={() => setDraft((value) => ({ ...value, accent: color }))} style={{ backgroundColor: color }} type="button">{draft.accent === color && <Check size={18} className="text-[#2e4227]" strokeWidth={3} />}</button>)}</div><p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#658c3b]"><i className="h-3 w-3 rounded-full border border-[#ced8c6]" style={{ backgroundColor: draft.accent }} />Selected: {draft.accent}</p></div><div className="flex flex-wrap gap-3"><button className="inline-flex items-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#354238]" onClick={() => onSave(draft)} type="button"><BadgeCheck size={16} />Save & update widget</button><button className="rounded-xl border border-[#d9e1d5] px-4 py-2.5 text-sm font-bold text-[#6e786d] transition hover:bg-[#f7faf4]" onClick={onReset} type="button">Reset defaults</button></div></section>
      <section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold tracking-[-.03em]">Saved preview</h2><p className="mt-1 text-xs text-[#899289]">Exactly what the widget will use</p></div><span className="rounded-full bg-[#edf8e5] px-2.5 py-1 text-[10px] font-bold text-[#5d9035]">Synced</span></div><div className="mt-5"><BotPreview settings={settings} /></div><div className="mt-5 rounded-xl bg-[#f4f8f0] p-4"><p className="text-xs font-bold text-[#637762]">Plan & usage</p><p className="mt-2 text-sm text-[#758075]">You are on <b>{plan}</b>. {documentCount} of {plan === "Starter" ? "20" : "unlimited"} knowledge sources used.</p>{plan === "Starter" && <button className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#69913d]" onClick={onUpgrade} type="button">Unlock Pro features <ChevronRight size={13} /></button>}</div></section></div>
  </div>;
}
