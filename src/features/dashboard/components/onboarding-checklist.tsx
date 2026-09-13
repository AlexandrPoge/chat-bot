import { ArrowRight, FileUp, MessageCircleMore, Palette } from "lucide-react";
import type { Section } from "../types";

type Props = { onGoTo: (section: Section) => void };

const steps = [
  { copy: "Add a PDF, DOCX, TXT, or Markdown source.", icon: FileUp, label: "Upload knowledge", section: "knowledge" as const },
  { copy: "Choose a name, greeting, and brand color.", icon: Palette, label: "Customize your bot", section: "settings" as const },
  { copy: "Ask a real question before publishing.", icon: MessageCircleMore, label: "Test the conversation", section: "conversations" as const },
];

export function OnboardingChecklist({ onGoTo }: Props) {
  return <section className="rounded-2xl border border-[#d7e5cf] bg-[linear-gradient(120deg,#eef8e7,#f9fcf6)] p-4 sm:p-5"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#6d9546]">Launch checklist</p><h2 className="mt-1 text-lg font-semibold tracking-[-.04em]">Build a customer-ready bot in three steps</h2></div><div className="mt-4 grid gap-2 lg:grid-cols-3">{steps.map(({ copy, icon: Icon, label, section }, index) => <button className="group flex items-start gap-3 rounded-xl border border-[#e0eadb] bg-white p-3 text-left transition hover:-translate-y-px hover:border-[#a9c990] hover:shadow-md" key={label} onClick={() => onGoTo(section)} type="button"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#edf6e6] text-[#66913e]"><Icon size={15} /></span><span className="min-w-0"><span className="flex items-center gap-1 text-xs font-bold text-[#455342]">{index + 1}. {label}<ArrowRight className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" size={12} /></span><span className="mt-1 block text-[11px] leading-4 text-[#7d887a]">{copy}</span></span></button>)}</div></section>;
}
