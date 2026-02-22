"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

export type Mode = "off" | "router" | "extender";

export type RouterConfig = {
  ssid: string;
  password: string;
  band: "2.4GHz" | "5GHz";
  channel: number;
  max_clients: number;
  subnet_base: string;
  dns_provider: "cloudflare" | "google" | "adguard" | "quad9";
};

export type ExtenderConfig = {
  upstream_ssid: string;
  upstream_password: string;
  extender_ssid: string;
  extender_password: string;
  extender_band: "2.4GHz" | "5GHz";
  use_second_radio: boolean;
};

export type WiFiConfig = {
  mode: Mode;
  router: RouterConfig;
  extender: ExtenderConfig;
};

export type WiFiStatus = {
  mode: Mode;
  active: boolean;
  ssid?: string;
  ap_interface?: string;
  subnet_base?: string;
  gateway_ip?: string;
  connected_ips: number;
  upstream_ssid?: string;
  error?: string;
};

export type ScannedNetwork = {
  ssid: string;
  signal_dbm: number;
  frequency: string;
  encrypted: boolean;
  mac: string;
};

export const DEFAULT_CONFIG: WiFiConfig = {
  mode: "off",
  router: {
    ssid: "StrctNet",
    password: "",
    band: "5GHz",
    channel: 36,
    max_clients: 20,
    subnet_base: "192.168.100",
    dns_provider: "cloudflare",
  },
  extender: {
    upstream_ssid: "",
    upstream_password: "",
    extender_ssid: "StrctNet-Ext",
    extender_password: "",
    extender_band: "5GHz",
    use_second_radio: false,
  },
};

export const CHANNELS: Record<string, number[]> = {
  "2.4GHz": [1, 6, 11],
  "5GHz": [36, 40, 44, 48, 149, 153, 157, 161],
};

export const DNS_OPTIONS = [
  {
    key: "cloudflare",
    label: "Cloudflare",
    ip: "1.1.1.1",
    desc: "Fastest · privacy-first",
  },
  {
    key: "google",
    label: "Google",
    ip: "8.8.8.8",
    desc: "Reliable · widely used",
  },
  {
    key: "adguard",
    label: "AdGuard",
    ip: "94.140.14.14",
    desc: "Blocks ads at DNS level",
  },
  {
    key: "quad9",
    label: "Quad9",
    ip: "9.9.9.9",
    desc: "Blocks malware domains",
  },
] as const;

export function signalBars(dbm: number): number {
  if (dbm > -50) return 4;
  if (dbm > -65) return 3;
  if (dbm > -75) return 2;
  return 1;
}

export function useDeviceWifi(selectedDeviceId: string | null) {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;

  const [config, setConfig] = useState<WiFiConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<WiFiStatus>({
    mode: "off",
    active: false,
    connected_ips: 0,
  });
  const [selectedMode, setSelectedMode] = useState<Mode>("off");

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<ScannedNetwork[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateRouter = useCallback(
    <K extends keyof RouterConfig>(key: K, value: RouterConfig[K]) =>
      setConfig((c) => ({ ...c, router: { ...c.router, [key]: value } })),
    [],
  );

  const updateExtender = useCallback(
    <K extends keyof ExtenderConfig>(key: K, value: ExtenderConfig[K]) =>
      setConfig((c) => ({ ...c, extender: { ...c.extender, [key]: value } })),
    [],
  );

  const fetchAll = useCallback(async () => {
    if (!url) return;
    try {
      const [cfgRes, stRes] = await Promise.all([
        fetch(`${url}/api/wifi/config`),
        fetch(`${url}/api/wifi/status`),
      ]);
      if (cfgRes.ok) {
        const cfg: WiFiConfig = await cfgRes.json();
        setConfig(cfg);
        setSelectedMode(cfg.mode);
      }
      if (stRes.ok) {
        const st: WiFiStatus = await stRes.json();
        setStatus(st);
        if (st.error) setError(st.error);
      }
    } catch {
      setError("Could not reach device");
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Load on mount
  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetchAll();
  }, [fetchAll, url]);

  // Poll status every 10s while active
  useEffect(() => {
    if (!url || !status.active) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${url}/api/wifi/status`);
        if (res.ok) setStatus(await res.json());
      } catch {}
    }, 10_000);
    return () => clearInterval(id);
  }, [url, status.active]);

  const apply = useCallback(async () => {
    if (!url) return;
    setApplying(true);
    setError(null);

    const payload: WiFiConfig = { ...config, mode: selectedMode };

    try {
      console.log("Applying WiFi config to URL:", `${url}/api/wifi/config`);

      const res = await fetch(`${url}/api/wifi/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Apply response:", res);
      if (!res.ok) {
        const body = await res.text();
        setError(body || `HTTP ${res.status}`);
        return;
      }
      setConfig(payload);

      let tries = 0;
      const poll = setInterval(async () => {
        tries++;
        const st = await fetch(`${url}/api/wifi/status`)
          .then((r) => r.json())
          .catch(() => null);
        if (st?.active || tries > 10) {
          clearInterval(poll);
          if (st) setStatus(st);
          setApplying(false);
        }
      }, 1500);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setApplying(false);
    }
  }, [url, config, selectedMode]);

  const stop = useCallback(async () => {
    if (!url) return;
    setStopping(true);
    try {
      await fetch(`${url}/api/wifi/stop`, { method: "POST" });
      setSelectedMode("off");
      setStatus((s) => ({ ...s, active: false, mode: "off" }));
    } finally {
      setStopping(false);
    }
  }, [url]);

  const scan = useCallback(async () => {
    if (!url) return;
    setScanning(true);
    setNetworks([]);
    try {
      const res = await fetch(`${url}/api/wifi/scan`);
      const data: ScannedNetwork[] = await res.json();
      setNetworks(data.sort((a, b) => b.signal_dbm - a.signal_dbm));
    } catch {
      setNetworks([]);
    } finally {
      setScanning(false);
    }
  }, [url]);

  return {
    config,
    status,
    selectedMode,
    networks,
    loading,
    applying,
    stopping,
    scanning,
    error,

    setSelectedMode,
    setError,
    updateRouter,
    updateExtender,

    fetchAll,
    apply,
    stop,
    scan,
  };
}
