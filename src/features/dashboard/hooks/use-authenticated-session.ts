import { useEffect, useState } from "react";
import { writeDemoSession } from "@/lib/auth-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState = { email?: string; ready: boolean };

export function useAuthenticatedSession(): AuthState {
  const [state, setState] = useState<AuthState>(() => ({ ready: getSupabaseBrowserClient() === null }));

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let active = true;
    const update = (email?: string) => {
      if (!active) return;
      if (email) writeDemoSession(email);
      setState({ email, ready: true });
    };
    void client.auth.getSession().then(({ data }) => update(data.session?.user.email)).catch(() => update());
    const { data } = client.auth.onAuthStateChange((_, session) => update(session?.user.email));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
