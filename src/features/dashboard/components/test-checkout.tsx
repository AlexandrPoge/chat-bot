"use client";

import { type FormEvent, useState } from "react";
import { ChevronRight, CreditCard, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";

type Props = { onClose: () => void; onPaid: () => Promise<boolean> };

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

export function TestCheckout({ onClose, onPaid }: Props) {
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const pay = (event: FormEvent) => {
    event.preventDefault();
    if (card.replace(/\s/g, "") !== "4242424242424242" || expiry.length < 4 || cvc.length < 3 || !name.trim()) {
      setError("Use test card 4242 4242 4242 4242, any future date, and any 3-digit CVC.");
      return;
    }
    setError("");
    setProcessing(true);
    window.setTimeout(() => { void onPaid().then((success) => { if (!success) setProcessing(false); }); }, 850);
  };
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[#172018]/55 p-4 backdrop-blur-sm"><section aria-modal="true" className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[1.5rem] bg-white p-5 shadow-2xl sm:p-6" role="dialog"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#729644]">Secure test checkout</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">One calm step to Pro</h2><p className="mt-2 text-sm leading-6 text-[#758075]">No card is stored and no money moves.</p></div><button aria-label="Close checkout" className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f4ef] text-[#7f897e] transition hover:rotate-90" onClick={onClose} type="button"><X size={16} /></button></div>
    <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#243129,#436143_55%,#91bf65)] p-5 text-white"><div className="flex justify-between text-[10px] font-bold uppercase tracking-[.16em] text-white/65"><span>Helpwise Pro</span><Sparkles size={16} className="text-[#d9fb97]" /></div><p className="mt-8 font-mono text-lg tracking-[.18em]">4242 4242 4242 4242</p><div className="mt-6 flex justify-between text-xs"><span>{name || "YOUR NAME"}</span><span>$39 / month</span></div></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f2f7ed] p-3 text-xs text-[#62745c]"><ShieldCheck size={16} className="shrink-0 text-[#6c9d40]" />Stripe-style sandbox: the test payment is logged in Supabase.</div>
    <form className="mt-5 space-y-3" onSubmit={pay}><label className="block text-xs font-bold text-[#596559]">Cardholder name<input className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3 py-2.5 text-sm outline-none focus:border-[#86ab5a]" onChange={(event) => setName(event.target.value)} placeholder="Alex Poge" value={name} /></label><label className="block text-xs font-bold text-[#596559]">Card number<div className="relative mt-1.5"><CreditCard className="absolute left-3 top-3 text-[#92a18d]" size={16} /><input className="w-full rounded-xl border border-[#dce4d8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#86ab5a]" inputMode="numeric" onChange={(event) => setCard(formatCard(event.target.value))} placeholder="4242 4242 4242 4242" value={card} /></div></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[#596559]">Expiry<input className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3 py-2.5 text-sm outline-none" onChange={(event) => setExpiry(event.target.value.slice(0, 5))} placeholder="12/30" value={expiry} /></label><label className="block text-xs font-bold text-[#596559]">CVC<input className="mt-1.5 w-full rounded-xl border border-[#dce4d8] px-3 py-2.5 text-sm outline-none" inputMode="numeric" onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" value={cvc} /></label></div>{error && <p className="rounded-lg bg-[#fff1ef] px-3 py-2 text-xs text-[#b2554a]">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#354238] disabled:opacity-60" disabled={processing} type="submit">{processing ? <><LoaderCircle className="animate-spin" size={15} />Processing test payment</> : <>Activate Pro in test mode <ChevronRight size={15} /></>}</button></form><p className="mt-4 text-center text-[10px] text-[#9ba39a]">Test card: 4242 4242 4242 4242 · any future date · any CVC</p></section></div>;
}
