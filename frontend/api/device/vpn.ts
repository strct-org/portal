"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

export interface VPNState {
  is_installed: boolean;
  is_running: boolean;
  is_exit_node: boolean;
  tailscale_ip: string;
  account: string;
  auth_key_set: boolean;
}

export const useDeviceVPNStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;

  const [vpnState, setVpnState] = useState<VPNState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch Status
  const fetchStatus = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(`${url}/api/vpn/status`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error("Failed to fetch VPN status");
      const data = await res.json();
      setVpnState(data);
      setError(null);
    } catch (err) {
      console.warn("VPN Status Fetch Error:", err);
      setError("Device unreachable");
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Initial Load & Polling
  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetchStatus();

    // Poll every 10 seconds to check connection status
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, url]);

  // Actions
  const setupVPN = async (authKey: string) => {
    if (!url) return;
    setProcessing(true);
    try {
      const res = await fetch(`${url}/api/vpn/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_key: authKey }),
      });
      if (!res.ok) throw new Error("Setup failed");

      // Re-fetch immediately to update UI
      await new Promise((r) => setTimeout(r, 2000)); // Wait for system to start
      await fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Failed to setup VPN. Check Auth Key.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleExitNode = async (enable: boolean) => {
    if (!url) return;
    setProcessing(true);
    try {
      const res = await fetch(`${url}/api/vpn/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable }),
      });
      if (!res.ok) throw new Error("Toggle failed");

      // Optimistic update
      setVpnState((prev) => (prev ? { ...prev, is_exit_node: enable } : null));

      // Verify after short delay
      setTimeout(fetchStatus, 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle Exit Node.");
    } finally {
      setProcessing(false);
    }
  };

  return {
    vpnState,
    loading,
    error,
    processing,
    setupVPN,
    toggleExitNode,
    refetch: fetchStatus,
  };
};
