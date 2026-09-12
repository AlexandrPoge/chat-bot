import { Check, ChevronRight, LockKeyhole } from "lucide-react";
import { planFeatures } from "../data";
import type { Plan } from "../types";

type Props = {
  choice: Plan;
  onChoose: (plan: Plan) => void;
  onClose: () => void;
  onContinue: () => void;
};

export function PlanDialog({ choice, onChoose, onClose, onContinue }: Props) {
  return <div className="fixed inset-0 z-30 grid place-items-center bg-[#172018]/55 p-4 backdrop-blur-sm"><section aria-modal="true" className="w-full max-w-2xl rounded-[1.5rem] bg-white p-5 shadow-2xl sm:p-6" role="dialog"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#729644]">Choose your plan</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">Start simple. Upgrade when useful.</h2></div><button aria-label="Close plans" className="text-2xl text-[#8c9689]" onClick={onClose} type="button">×</button></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{(["Starter", "Pro"] as Plan[]).map((plan) => { const selected = choice === plan; return <button className={`relative rounded-2xl border p-5 text-left transition ${selected ? "border-[#7ca94c] bg-[#f4faef] shadow-md" : "border-[#e0e6dc] hover:border-[#b6cf9d]"}`} key={plan} onClick={() => onChoose(plan)} type="button">{selected && <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-[#7ca94c] text-white"><Check size={14} /></span>}<p className="font-bold">{plan}</p><p className="mt-4 text-3xl font-semibold">{plan === "Starter" ? "$0" : "$39"}<span className="ml-1 text-sm font-medium text-[#909a8f]">/ month</span></p><ul className="mt-4 space-y-2.5">{planFeatures[plan].map(({ label, icon: Icon }) => <li className="flex items-center gap-2 text-xs font-medium text-[#627062]" key={label}><span className="grid h-5 w-5 place-items-center rounded-md bg-white text-[#6d993f]"><Icon size={12} /></span>{label}</li>)}</ul></button>; })}</div>
    <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-px" onClick={onContinue} type="button">{choice === "Pro" ? "Continue to test payment" : "Keep Starter"}<ChevronRight size={15} /></button><p className="mt-3 flex justify-center gap-1.5 text-center text-[10px] text-[#8b9689]"><LockKeyhole size={11} />No card data is stored in this demo.</p></section></div>;
}
