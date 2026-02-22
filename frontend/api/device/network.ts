"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

// ── Network Stats (unchanged) ─────────────────────────────────────────────────
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

// ── Ad Blocker ────────────────────────────────────────────────────────────────
// New adblock.go endpoints:
//   GET  /api/adblock/config  → { enabled, update_schedule }
//   POST /api/adblock/config  → apply config
//   GET  /api/adblock/status  → { enabled, entry_count, last_updated, updating, update_error }
//   POST /api/adblock/update  → trigger immediate blocklist re-download
//
// Removed (old in-process DNS server, gone in package split):
//   GET  /api/adblock/stats   ← no longer exists
//   POST /api/adblock/toggle  ← replaced by POST /api/adblock/config

// Legacy types kept so the existing UI imports don't break
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

// New shape from adblock.go
export interface AdBlockConfig {
  enabled: boolean;
  update_schedule: "daily" | "weekly" | "manual";
}

export interface AdBlockStatus {
  enabled: boolean;
  entry_count: number;
  last_updated: string;   // RFC3339, "0001-01-01T00:00:00Z" when never updated
  updating: boolean;
  update_error?: string;
}

// Legacy interface kept so the page compiles unchanged — zero'd where unavailable
export interface AdBlockerStats {
  is_enabled: boolean;
  // New real fields
  entry_count: number;
  last_updated: string;
  updating: boolean;
  update_error?: string;
  update_schedule: "daily" | "weekly" | "manual";
  // Old fields that no longer exist — always 0/empty so the page renders gracefully
  total_queries: number;
  blocked_queries: number;
  block_ratio: number;
  chart_data: TrafficPoint[];
  recent_logs: BlockLog[];
}

export const useDeviceAdBlockerStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url  = selectedDeviceId ? urls[selectedDeviceId] : null;

  const [config,     setConfig]     = useState<AdBlockConfig | null>(null);
  const [status,     setStatus]     = useState<AdBlockStatus | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!url) return;
    try {
      const [cfgRes, stRes] = await Promise.all([
        fetch(`${url}/api/adblock/config`, { signal: AbortSignal.timeout(4000) }),
        fetch(`${url}/api/adblock/status`, { signal: AbortSignal.timeout(4000) }),
      ]);
      if (cfgRes.ok) setConfig(await cfgRes.json());
      if (stRes.ok)  setStatus(await stRes.json());
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetchStats();
    const id = setInterval(fetchStats, 8000);
    return () => clearInterval(id);
  }, [fetchStats, url]);

  // Toggle enabled — POST /api/adblock/config with flipped enabled
  const toggleBlocker = useCallback(async () => {
    if (!url || !config) return;
    setIsToggling(true);
    const next: AdBlockConfig = { ...config, enabled: !config.enabled };
    // Optimistic
    setConfig(next);
    setStatus(prev => prev ? { ...prev, enabled: next.enabled } : null);
    try {
      const res = await fetch(`${url}/api/adblock/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTimeout(fetchStats, 3000);
    } catch {
      // Revert
      setConfig(config);
      setStatus(prev => prev ? { ...prev, enabled: config.enabled } : null);
    } finally {
      setIsToggling(false);
    }
  }, [url, config, fetchStats]);

  // Set update schedule
  const setSchedule = useCallback(async (schedule: AdBlockConfig["update_schedule"]) => {
    if (!url || !config) return;
    const next: AdBlockConfig = { ...config, update_schedule: schedule };
    setConfig(next);
    try {
      await fetch(`${url}/api/adblock/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {
      setConfig(config);
    }
  }, [url, config]);

  // Trigger immediate blocklist refresh — POST /api/adblock/update
  const triggerUpdate = useCallback(async () => {
    if (!url) return;
    setIsUpdating(true);
    setStatus(prev => prev ? { ...prev, updating: true } : null);
    try {
      await fetch(`${url}/api/adblock/update`, { method: "POST" });
      // Poll until updating=false
      const poll = setInterval(async () => {
        const res = await fetch(`${url}/api/adblock/status`).catch(() => null);
        if (!res?.ok) return;
        const st: AdBlockStatus = await res.json();
        if (!st.updating) {
          setStatus(st);
          clearInterval(poll);
          setIsUpdating(false);
        }
      }, 2000);
      setTimeout(() => { clearInterval(poll); setIsUpdating(false); }, 60_000);
    } catch {
      setIsUpdating(false);
      setStatus(prev => prev ? { ...prev, updating: false } : null);
    }
  }, [url]);

  // Build legacy `stats` shape — UI uses this directly
  const stats: AdBlockerStats | null = (config || status) ? {
    is_enabled:      status?.enabled          ?? config?.enabled ?? false,
    entry_count:     status?.entry_count      ?? 0,
    last_updated:    status?.last_updated     ?? "",
    updating:        status?.updating         ?? isUpdating,
    update_error:    status?.update_error,
    update_schedule: config?.update_schedule  ?? "manual",
    // Gone in package split — zeroed so existing UI renders empty states
    total_queries:   0,
    blocked_queries: 0,
    block_ratio:     0,
    chart_data:      [],
    recent_logs:     [],
  } : null;

  return {
    stats,
    config,
    status,
    loading,
    isToggling,
    isUpdating,
    toggleBlocker,
    setSchedule,
    triggerUpdate,
    refetch: fetchStats,
  };
};