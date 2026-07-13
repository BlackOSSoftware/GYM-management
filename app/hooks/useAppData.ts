"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAppData } from "../lib/api/client";
import type { AppData } from "../lib/types";

export function useAppData(initialData?: AppData) {
  const [data, setData] = useState<AppData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await fetchAppData();
      setData(next);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) refresh();
  }, [initialData, refresh]);

  return { data, loading, error, refresh, setData };
}
