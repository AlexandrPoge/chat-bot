import { Check, Clipboard, ExternalLink, Sparkles } from "lucide-react";
import type { DashboardDocument } from "../types";

type Props = {
  activeDocument?: DashboardDocument;
  copied: boolean;
  code: string;
  onCopy: () => void;
};

export function WidgetPage({ activeDocument, copied, code, onCopy }: Props) {
  return <div><p className="text-sm font-medium text-[#73806e]">Meet customers where they are</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.06em]">Website widget</h1><p className="mt-2 text-sm text-[#7d877c]">Copy one small snippet to add your selected knowledge source to any website.</p>
    <div className="mt-6 grid gap-5 xl:grid-cols-[.75fr_1.25fr]"><section className="rounded-2xl border border-[#e0e6dc] bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf7de] text-[#629238]"><Sparkles size={18} /></span><div><h2 className="font-semibold">Embed your bot</h2><p className="mt-1 text-xs text-[#889287]">The snippet opens the responsive customer widget.</p></div></div><pre className="mt-6 overflow-x-auto rounded-xl bg-[#1e2820] p-4 text-xs leading-6 text-[#d9fb97]"><code>{code}</code></pre><div className="mt-4 flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-xl bg-[#202823] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px" onClick={onCopy} type="button">{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "Copied" : "Copy embed code"}</button><a className="inline-flex items-center gap-2 rounded-xl border border-[#d6e1d0] px-4 py-2.5 text-sm font-bold text-[#5b7154] transition hover:bg-[#f4f8ef]" href="/demo.html" rel="noreferrer" target="_blank"><ExternalLink size={15} />Open test site</a></div><div className="mt-5 rounded-xl bg-[#f1f7ec] p-3 text-xs font-bold text-[#688a47]"><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#72a648]" />Uses {activeDocument?.name ?? "your selected source"}</div></section>
      <section className="overflow-hidden rounded-2xl border border-[#dce6d6] bg-[#edf4e9] p-3"><div className="flex items-center justify-between px-2 pb-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#79934f]">Interactive preview</p><p className="mt-1 text-xs text-[#71806e]">A real web page with the widget floating in its corner.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#648c3f]">Live test</span></div><iframe className="h-[min(590px,72dvh)] min-h-[420px] w-full rounded-[18px] border border-[#d6e3d1] bg-white shadow-sm" src="/demo.html" title="Helpwise widget test site" /></section></div>
  </div>;
}
