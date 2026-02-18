"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

export interface VPNState {
  is_installed: boolean;
  is_running: boolean;
  is_exit_node: boolean;
  tailscale_ip: string;
  account: string;
  error_message?: string;
}

export const useDeviceVPNStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;

  const [vpnState, setVpnState] = useState<VPNState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(`${url}/api/vpn/status`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error("Failed to fetch VPN status");
      const data = await res.json();
      console.log(data);

      setVpnState(data);
      setError(null);
    } catch (err) {
      setError("Device unreachable");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus, url]);

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

      // Re-fetch to confirm
      setTimeout(fetchStatus, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle VPN mode.");
    } finally {
      setProcessing(false);
    }
  };

  return {
    vpnState,
    loading,
    error,
    processing,
    toggleExitNode,
    refetch: fetchStatus,
  };
};
