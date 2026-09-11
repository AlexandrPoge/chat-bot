"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { writeDemoSession } from "@/lib/auth-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address to continue.");
      return;
    }
    if (password.length < 4) {
      setError("Use at least 4 characters for this demo password.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    setPending(true);
    if (supabase) {
      const result = mode === "register"
        ? await supabase.auth.signUp({ email: normalizedEmail, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
        : await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (result.error) {
        setError(result.error.message);
        setPending(false);
        return;
      }
    }
    writeDemoSession(normalizedEmail);
    router.push("/dashboard");
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      setError("Google sign-in becomes available after the Supabase public key is configured. Email/password works in local demo mode now.");
      return;
    }
    setPending(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  };

  return <main className="grid min-h-dvh place-items-center overflow-hidden bg-[#f7faf4] p-5 text-[#273128]"><div className="pointer-events-none absolute left-1/2 top-[-210px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#d9fb97]/55 blur-3xl" /><section className="relative w-full max-w-md rounded-[2rem] border border-[#dce6d7] bg-white p-7 shadow-[0_32px_90px_-40px_rgba(37,60,34,.5)] sm:p-9"><Link className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-.05em]" href="/"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#202823] text-[#d9fb97]"><Sparkles size={17} /></span>helpwise</Link><div className="mt-8 flex rounded-xl bg-[#f0f4ed] p-1 text-sm font-bold"><button className={`flex-1 rounded-lg px-3 py-2 transition-all ${mode === "login" ? "bg-white text-[#425a32] shadow-sm" : "text-[#829080]"}`} onClick={() => { setMode("login"); setError(""); }} type="button">Log in</button><button className={`flex-1 rounded-lg px-3 py-2 transition-all ${mode === "register" ? "bg-white text-[#425a32] shadow-sm" : "text-[#829080]"}`} onClick={() => { setMode("register"); setError(""); }} type="button">Create account</button></div><p className="mt-7 text-xs font-bold uppercase tracking-[.14em] text-[#729247]">{mode === "login" ? "Welcome back" : "Get started free"}</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.06em]">{mode === "login" ? "Log in to your workspace" : "Create your workspace"}</h1><p className="mt-3 text-sm leading-6 text-[#758075]">{supabase ? "Supabase authentication is connected to this form." : "Local demo mode is active until Supabase keys are added."}</p><form className="mt-7 space-y-4" onSubmit={submit}><label className="block text-sm font-bold text-[#4c574c]">Email<input autoComplete="email" className="mt-2 w-full rounded-xl border border-[#dce4d8] px-3 py-3 text-sm outline-none transition focus:border-[#8bb660] focus:ring-4 focus:ring-[#dff0cc]" onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.com" type="email" value={email} /></label><label className="block text-sm font-bold text-[#4c574c]">Password<input autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-2 w-full rounded-xl border border-[#dce4d8] px-3 py-3 text-sm outline-none transition focus:border-[#8bb660] focus:ring-4 focus:ring-[#dff0cc]" onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" type="password" value={password} /></label>{error && <p className="rounded-xl bg-[#fff1ef] px-3 py-2.5 text-xs text-[#af554b]">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#202823] px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#354238] hover:shadow-lg disabled:opacity-60" disabled={pending} type="submit">{pending ? "Connecting…" : mode === "login" ? "Log in" : "Create account"} <ArrowRight size={16} /></button></form><div className="mt-4 flex items-center gap-3"><i className="h-px flex-1 bg-[#e3e9df]" /><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#a0aa9d]">or</span><i className="h-px flex-1 bg-[#e3e9df]" /></div><button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8e2d2] px-4 py-3 text-sm font-bold text-[#51604e] transition hover:-translate-y-px hover:bg-[#f7faf4] disabled:opacity-60" disabled={pending} onClick={signInWithGoogle} type="button"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#edf4e8] text-[10px] text-[#5b7c3d]">G</span>Continue with Google</button><p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#8b9689]"><LockKeyhole size={12} />{supabase ? "Your password is handled by Supabase Auth." : "Demo mode never stores your password."}</p></section></main>;
}
