// api/device/vpn.ts
// Updated to match the new vpn.go API from the package split.
//
// New endpoints:
//   GET  /api/vpn/config  → VPNConfig
//   POST /api/vpn/config  → apply (enable/disable, set auth key, exit node)
//   GET  /api/vpn/status  → Status
//   POST /api/vpn/stop    → disconnect tailscale
//
// Old endpoints REMOVED:
//   POST /api/vpn/toggle  ← gone, replaced by POST /api/vpn/config

"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

// ── Types matching vpn.go exactly ────────────────────────────────────────────

export interface VPNConfig {
  enabled: boolean;
  auth_key?: string;          // tskey-auth-xxx, masked as "tskey-***" in GET response
  advertise_exit_node: boolean;
}

export interface VPNStatus {
  enabled: boolean;
  tailscale_up: boolean;
  advertised_subnet?: string; // e.g. "192.168.100.0/24" — read from wifi.Status()
  tailscale_ip?: string;      // Orange Pi's 100.x.x.x address
  peer_count: number;
  exit_node_active: boolean;
  error?: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useDeviceVPNStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url  = selectedDeviceId ? urls[selectedDeviceId] : null;

  const [config,     setConfig]     = useState<VPNConfig | null>(null);
  const [vpnState,   setVpnState]   = useState<VPNStatus | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // ── Fetch both config + status ──────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!url) return;
    try {
      const [cfgRes, stRes] = await Promise.all([
        fetch(`${url}/api/vpn/config`, { signal: AbortSignal.timeout(4000) }),
        fetch(`${url}/api/vpn/status`, { signal: AbortSignal.timeout(4000) }),
      ]);

      if (!cfgRes.ok || !stRes.ok) throw new Error("VPN fetch failed");

      const [cfg, st]: [VPNConfig, VPNStatus] = await Promise.all([
        cfgRes.json(),
        stRes.json(),
      ]);

      setConfig(cfg);
      setVpnState(st);
      setError(null);
    } catch {
      setError("Device unreachable");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetchStatus();
    const id = setInterval(fetchStatus, 8000);
    return () => clearInterval(id);
  }, [fetchStatus, url]);

  // ── Toggle exit node ────────────────────────────────────────────────────
  // POST /api/vpn/config with updated advertise_exit_node value.
  const toggleExitNode = useCallback(async (enable: boolean) => {
    if (!url || !config) return;
    setProcessing(true);

    // Optimistic update
    setVpnState(prev => prev ? { ...prev, exit_node_active: enable } : null);

    try {
      const res = await fetch(`${url}/api/vpn/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          enabled: true,
          advertise_exit_node: enable,
          auth_key: "tskey-***", // server preserves existing key when it sees the mask
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Re-fetch to confirm
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Toggle failed");
      // Revert optimistic update
      setVpnState(prev => prev ? { ...prev, exit_node_active: !enable } : null);
    } finally {
      setProcessing(false);
    }
  }, [url, config, fetchStatus]);

  // ── Enable/disable VPN entirely ─────────────────────────────────────────
  const setEnabled = useCallback(async (enabled: boolean, authKey?: string) => {
    if (!url || !config) return;
    setProcessing(true);
    try {
      if (!enabled) {
        // POST /api/vpn/stop to disconnect gracefully
        await fetch(`${url}/api/vpn/stop`, { method: "POST" });
        setVpnState(prev => prev ? { ...prev, enabled: false, tailscale_up: false } : null);
      } else {
        const res = await fetch(`${url}/api/vpn/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...config,
            enabled: true,
            auth_key: authKey || config.auth_key || "tskey-***",
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setTimeout(fetchStatus, 2000);
   } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed");
    } finally {
      setProcessing(false);
    }
  }, [url, config, fetchStatus]);

  // ── Update auth key ─────────────────────────────────────────────────────
  const setAuthKey = useCallback(async (authKey: string) => {
    if (!url || !config) return;
    setProcessing(true);
    try {
      const res = await fetch(`${url}/api/vpn/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, auth_key: authKey }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTimeout(fetchStatus, 1000);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  }, [url, config, fetchStatus]);

  return {
    // Old fields — kept for backwards compat with the existing UI component
    vpnState: vpnState ? {
      // Map new shape → old shape so the existing LocalVPN component still works
      is_installed:  vpnState.tailscale_up || vpnState.enabled,
      is_running:    vpnState.tailscale_up,
      is_exit_node:  vpnState.exit_node_active,
      tailscale_ip:  vpnState.tailscale_ip || "",
      account:       vpnState.advertised_subnet || "",
      error_message: vpnState.error,
      // New fields exposed directly
      peer_count:        vpnState.peer_count,
      advertised_subnet: vpnState.advertised_subnet,
      enabled:           vpnState.enabled,
    } : null,

    // New fields
    config,
    status: vpnState,

    // Actions
    loading,
    error,
    processing,
    toggleExitNode,
    setEnabled,
    setAuthKey,
    refetch: fetchStatus,
  };
};