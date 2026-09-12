import { Check, Clipboard, Sparkles } from "lucide-react";
import type { BotSettings } from "@/lib/bot-settings";
import type { DashboardDocument } from "../types";

type Props = {
  activeDocument?: DashboardDocument;
  copied: boolean;
  code: string;
  settings: BotSettings;
  onCopy: () => void;
};

export function WidgetPage({ activeDocument, copied, code, settings, onCopy }: Props) {
  return <div><p className="text-sm font-medium text-[#73806e]">Meet customers where they are</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Website widget</h1><p className="mt-2 text-sm text-[#7d877c]">Copy one small snippet to add your selected knowledge source to any website.</p>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.75fr]"><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf7de] text-[#629238]"><Sparkles size={18} /></span><div><h2 className="font-semibold">Embed your bot</h2><p className="mt-1 text-xs text-[#889287]">The snippet opens the responsive customer widget.</p></div></div><pre className="mt-6 overflow-x-auto rounded-xl bg-[#1e2820] p-4 text-xs leading-6 text-[#d9fb97]"><code>{code}</code></pre><button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px" onClick={onCopy} type="button">{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "Copied" : "Copy embed code"}</button></section>
      <section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#79934f]">Widget is ready</p><h2 className="mt-3 text-xl font-semibold tracking-[-.04em]">{settings.name}</h2><p className="mt-2 text-sm leading-6 text-[#758075]">Uses <b>{activeDocument?.name ?? "your selected source"}</b> and the saved name, welcome message, and accent color.</p><div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f1f7ec] p-3 text-xs font-bold text-[#688a47]"><i className="h-2 w-2 rounded-full bg-[#72a648]" />Responsive, mobile-ready, and source-cited</div></section></div>
  </div>;
}
