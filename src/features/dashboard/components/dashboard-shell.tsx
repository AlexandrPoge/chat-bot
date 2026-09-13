import Link from "next/link";
import { CircleHelp, LogOut, ReceiptText } from "lucide-react";
import type { DemoSession } from "@/lib/auth-session";
import { navigation } from "../data";
import { BotSwitcher } from "./bot-switcher";
import type { CloudBot, Plan, Section } from "../types";

type Props = {
  active: Section;
  activeBotId: string;
  bots: CloudBot[];
  children: React.ReactNode;
  plan: Plan;
  profileOpen: boolean;
  session: DemoSession | null;
  toast: string;
  onGoTo: (section: Section) => void;
  onBotCreate: () => void;
  onBotDelete: () => void;
  onBotSelect: (id: string) => void;
  onLogout: () => void;
  onProfileToggle: () => void;
  onUpgrade: () => void;
};

export function DashboardShell(props: Props) {
  const { active, activeBotId, bots, children, plan, profileOpen, session, toast, onBotCreate, onBotDelete, onBotSelect, onGoTo, onLogout, onProfileToggle, onUpgrade } = props;
  return <main className="min-h-dvh bg-[#f7f8f4] text-[#293229]"><aside className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-[#e1e7dc] bg-white/95 px-2 backdrop-blur lg:inset-y-0 lg:left-0 lg:right-auto lg:h-dvh lg:w-64 lg:flex-col lg:items-stretch lg:justify-start lg:border-r lg:border-t-0 lg:px-4 lg:py-6"><Link className="hidden items-center gap-2.5 px-2 text-xl font-semibold tracking-[-.05em] lg:flex" href="/"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#202823] text-[#d9fb97]">✦</span>helpwise</Link><div className="mt-6 hidden lg:block"><BotSwitcher activeId={activeBotId} bots={bots} onCreate={onBotCreate} onDelete={onBotDelete} onSelect={onBotSelect} /></div><nav className="flex w-full items-center justify-around gap-1 lg:mt-6 lg:block lg:space-y-1">{navigation.map(({ id, label, icon: Icon }) => <button className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm ${active === id ? "bg-[#eaf4e2] text-[#4c792d]" : "text-[#879086] hover:bg-[#f1f5ee] hover:text-[#596558]"}`} key={id} onClick={() => onGoTo(id)} type="button"><Icon size={17} /><span className="truncate">{label}</span></button>)}</nav><div className="hidden lg:mt-auto lg:block"><button className="flex w-full items-center gap-2 rounded-xl bg-[#202823] px-3 py-2.5 text-left text-xs font-bold text-white transition hover:bg-[#354238]" onClick={onUpgrade} type="button"><ReceiptText size={15} />{plan === "Pro" ? "Pro plan active" : "Upgrade to Pro"}</button><a className="mt-3 flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#879086] transition hover:text-[#5f714f]" href="mailto:hello@helpwise.ai"><CircleHelp size={15} />Help & feedback</a></div></aside>
    <div className="min-h-dvh pb-20 lg:pl-64 lg:pb-0"><header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-[#e2e7df] bg-[#f7f8f4]/90 px-3 backdrop-blur sm:px-8"><div className="min-w-0 flex-1 lg:hidden"><BotSwitcher activeId={activeBotId} bots={bots} compact onCreate={onBotCreate} onDelete={onBotDelete} onSelect={onBotSelect} /></div><p className="hidden text-xs font-bold uppercase tracking-[.14em] text-[#879386] lg:block">Your workspace</p><div className="relative shrink-0"><button aria-expanded={profileOpen} className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 text-sm font-bold transition hover:bg-white sm:px-2" onClick={onProfileToggle} type="button"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9fb97] text-xs text-[#3b5132]">{session?.initials ?? "AP"}</span><span className="hidden sm:block">{session?.email.split("@")[0] ?? "Alex"}</span></button>{profileOpen && <div className="absolute right-0 top-12 w-56 rounded-xl border border-[#e0e6dc] bg-white p-2 shadow-xl"><p className="px-3 py-2 text-xs text-[#7e897c]">{session?.email ?? "Demo workspace"}</p><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#bf5d54] transition hover:bg-[#fff3f1]" onClick={onLogout} type="button"><LogOut size={15} />Log out</button></div>}</div></header><section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">{children}</section></div>
    {toast && <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#202823] px-4 py-3 text-center text-xs font-bold text-white shadow-xl lg:bottom-6">{toast}</div>}
  </main>;
}
