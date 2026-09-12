"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticatedSession } from "@/features/dashboard/hooks/use-authenticated-session";
import { DashboardWorkspace } from "./dashboard-workspace";

export default function DashboardClient() {
  const router = useRouter();
  const auth = useAuthenticatedSession();

  useEffect(() => {
    if (auth.ready && !auth.email) router.replace("/login");
  }, [auth.email, auth.ready, router]);

  if (!auth.ready) {
    return <main className="grid min-h-dvh place-items-center bg-[#f7f8f4] text-sm font-bold text-[#647063]">Checking your secure session…</main>;
  }
  if (!auth.email) return null;
  return <DashboardWorkspace />;
}
