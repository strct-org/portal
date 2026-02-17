"use client";

import { useState, useEffect, useCallback } from "react";
import { useDeviceUrls } from "./core";

export interface PortRule {
  id: string;
  name: string;
  port: number;
  device_ip: string;
  protocol: "TCP" | "UDP" | "BOTH";
}

export interface RouterConfig {
  ssid: string;
  password: string;
  security_mode: "WPA2" | "WPA3";
  is_hidden: boolean;
  frequency: "2.4GHz" | "5GHz" | "DUAL";
  tx_power: "20" | "30";
  dns_provider: "cloudflare" | "google" | "isp";
  firewall_enabled: boolean;
  upnp_enabled: boolean;
  guest_network: boolean;
  port_rules: PortRule[];
}

export interface ConnectedDevice {
  id: string;
  mac: string;
  ip: string;
  name: string;
  type: "mobile" | "laptop" | "desktop" | "other";
  usage: string;
  blocked: boolean;
  limited: boolean;
}

export const useRouterSettings = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;

  const [config, setConfig] = useState<RouterConfig | null>(null);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initial Fetch
  const fetchData = useCallback(async () => {
    if (!url) return;
    try {
      const [configRes, devicesRes] = await Promise.all([
        fetch(`${url}/api/router/config`, {
          signal: AbortSignal.timeout(5000),
        }),
        fetch(`${url}/api/router/devices`, {
          signal: AbortSignal.timeout(5000),
        }),
      ]);

      if (configRes.ok) setConfig(await configRes.json());
      if (devicesRes.ok) setDevices(await devicesRes.json());
    } catch (err) {
      console.error("Router fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for devices
  useEffect(() => {
    if (!url || loading) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${url}/api/router/devices`, {
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) setDevices(await res.json());
      } catch (e) {
        console.warn(e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [url, loading]);

  // Updaters
  const updateSetting = <K extends keyof RouterConfig>(
    key: K,
    value: RouterConfig[K]
  ) => {
    setConfig((prev) => {
      if (!prev) return null;
      setHasChanges(true);
      return { ...prev, [key]: value };
    });
  };

  const addPortRule = (rule: Omit<PortRule, "id">) => {
    setConfig((prev) => {
      if (!prev) return null;
      setHasChanges(true);
      return {
        ...prev,
        port_rules: [
          ...prev.port_rules,
          { ...rule, id: Math.random().toString() },
        ],
      };
    });
  };

  const removePortRule = (id: string) => {
    setConfig((prev) =>
      prev
        ? { ...prev, port_rules: prev.port_rules.filter((r) => r.id !== id) }
        : null
    );
  };

  const toggleBlockDevice = async (
    mac: string,
    currentBlockStatus: boolean
  ) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.mac === mac ? { ...d, blocked: !currentBlockStatus } : d
      )
    );
    try {
      await fetch(`${url}/api/router/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, block: !currentBlockStatus }),
      });
    } catch {
      setDevices((prev) =>
        prev.map((d) =>
          d.mac === mac ? { ...d, blocked: currentBlockStatus } : d
        )
      );
    }
  };

  const saveChanges = async () => {
    if (!config || !url) return;
    setSaving(true);
    try {
      const res = await fetch(`${url}/api/router/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed");
      setHasChanges(false);
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    devices,
    loading,
    saving,
    hasChanges,
    updateSetting,
    addPortRule,
    removePortRule,
    toggleBlockDevice,
    saveChanges,
  };
};
