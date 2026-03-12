import { useEffect, useMemo, useState } from "react";

function getStorageKey(userId?: string | null) {
  return `footyforecast:watchlist:${userId ?? "guest"}`;
}

export function usePersistentWatchlist(userId?: string | null) {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) {
      setWatchedIds(new Set());
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setWatchedIds(new Set(parsed.map(String)));
      }
    } catch {
      setWatchedIds(new Set());
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.from(watchedIds)));
  }, [userId, watchedIds]);

  const api = useMemo(() => ({
    watchedIds,
    toggleWatch: (id: string) => {
      setWatchedIds((previous) => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    setWatchedIds,
  }), [watchedIds]);

  return api;
}
