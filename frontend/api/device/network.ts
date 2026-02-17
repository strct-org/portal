"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

// --- Network Stats ---
export interface NetworkStats {
  latency: number | null;
  loss: number | null;
  isDown: boolean | null;
  bandwidth: number | null;
  timestamp: string | null;
}

export const useDeviceNetworkStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch(`${url}/api/network/stats`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats({
        latency: data.latency,
        loss: data.loss,
        isDown: data.is_down,
        bandwidth: data.bandwidth,
        timestamp: data.timestamp,
      });
    } catch {
      setError("Could not retrieve network health");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// --- Ad Blocker ---
export interface TrafficPoint {
  time: string;
  total: number;
  blocked: number;
}
export interface BlockLog {
  id: number;
  domain: string;
  time: string;
  source: string;
}
export interface AdBlockerStats {
  total_queries: number;
  blocked_queries: number;
  block_ratio: number;
  is_enabled: boolean;
  chart_data: TrafficPoint[];
  recent_logs: BlockLog[];
}

export const useDeviceAdBlockerStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;
  const [stats, setStats] = useState<AdBlockerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(`${url}/api/adblock/stats`, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats, url]);

  const toggleBlocker = async () => {
    if (!url) return;
    setIsToggling(true);
    try {
      const res = await fetch(`${url}/api/adblock/toggle`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStats((p) => (p ? { ...p, is_enabled: data.is_enabled } : null));
        await fetchStats();
      }
    } finally {
      setIsToggling(false);
    }
  };

  return { stats, loading, isToggling, toggleBlocker, refetch: fetchStats };
};
