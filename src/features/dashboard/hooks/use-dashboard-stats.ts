import { useEffect, useState } from "react";
import { accessToken } from "../knowledge-api";
import type { DashboardStats } from "../types";

const EMPTY_STATS: DashboardStats = { answers: 0, conversations: 0, groundedAnswers: 0, sources: 0 };

export function useDashboardStats(botId: string, refreshKey: number) {
  const [stats, setStats] = useState(EMPTY_STATS);
  useEffect(() => {
    if (!botId) return;
    let cancelled = false;
    void accessToken().then(async (token) => {
      if (!token) return;
      const response = await fetch(`/api/stats?botId=${encodeURIComponent(botId)}`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json() as DashboardStats;
      if (response.ok && !cancelled) setStats(body);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [botId, refreshKey]);
  return stats;
}
