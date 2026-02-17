"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePortal } from "@/providers/PortalProvider";

export interface DeviceLiveStats {
  isOnline: boolean;
  storageUsed: number;
  storageTotal: number;
  ipAddress?: string;
  uptime?: number;
}

export interface FileItem {
  name: string;
  size: string;
  type: "file" | "folder";
  modifiedAt: string;
}

export interface NetworkStats {
  latency: number | null; // ms
  loss: number | null; // %
  isDown: boolean | null; // critical state
  bandwidth: number | null; // Mbps
  timestamp: string | null;
}
export const useDeviceUrls = () => {
  const { devices } = usePortal();

  return useMemo(() => {
    const urlMap: Record<string, string> = {};
    devices.forEach((device) => {
      urlMap[device.id] = `https://${device.id}.strct.org`;
    });
    return urlMap;
  }, [devices]);
};

export const useAllDevicesLiveStats = () => {
  const { devices } = usePortal();
  const urls = useDeviceUrls();

  const [stats, setStats] = useState<Record<string, DeviceLiveStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (devices.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const promises = devices.map(async (device) => {
        const url = urls[device.id];
        try {
          const res = await fetch(`${url}/api/status`, {
            method: "GET",
            // shorter timeout so dashboard doesn't hang on offline devices
            signal: AbortSignal.timeout(3000),
          });

          if (!res.ok) throw new Error("Offline");

          const data = await res.json();
          return {
            id: device.id,
            data: {
              isOnline: true,
              storageUsed: data.used, // Ensure your API maps to this
              storageTotal: data.total,
              ipAddress: data.ip,
              uptime: data.uptime,
            } as DeviceLiveStats,
          };
        } catch (error) {
          // If fetch fails, device is considered OFFLINE
          return {
            id: device.id,
            data: {
              isOnline: false,
              storageUsed: 0,
              storageTotal: 0,
            } as DeviceLiveStats,
          };
        }
      });

      // Wait for all to finish (whether success or fail)
      const results = await Promise.all(promises);

      // Convert array back to Map
      const newStats: Record<string, DeviceLiveStats> = {};
      results.forEach((r) => {
        newStats[r.id] = r.data;
      });

      setStats(newStats);
      setLoading(false);
    };

    fetchAllStats();
  }, [devices, urls]);

  return { stats, loading };
};

export const useDeviceFiles = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      const url = urls[selectedDeviceId];

      try {
        const res = await fetch(`${url}/api/files`);

        if (!res.ok) throw new Error("Failed to connect to device");

        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error(err);
        setError("Device unreachable or permission denied");
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [selectedDeviceId, urls]);

  return { files, loading, error };
};

export const useDeviceNetworkStats = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!selectedDeviceId) return;
    const url = urls[selectedDeviceId];
    if (!url) {
      console.log("[NetworkStats] Waiting for device URL...");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      console.log("[NetworkStats] Fetching data...");
      `${url}/api/network/stats`;
      console.log(` mrk to ${url}/api/network/stats`);

      const res = await fetch(`${url}/api/network/stats`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) throw new Error("Failed to fetch network metrics");

      const data = await res.json();
      console.log("[NetworkStats] Fetched data:", data);

      setStats({
        latency: data.latency,
        loss: data.loss,
        isDown: data.is_down,
        bandwidth: data.bandwidth,
        timestamp: data.timestamp,
      });
    } catch (err) {
      console.error("[NetworkStats]", err);
      setError("Could not retrieve network health");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId, urls]);

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

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
  const [stats, setStats] = useState<AdBlockerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const url = selectedDeviceId ? urls[selectedDeviceId] : null;

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    if (!url) return;

    try {
      // Short timeout to prevent hanging on dashboard
      const res = await fetch(`${url}/api/adblock/stats`, {
        method: "GET",
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) throw new Error("Failed to fetch adblock stats");

      const data: AdBlockerStats = await res.json();
      console.log(data);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("[AdBlocker]", err);
      // Don't clear stats immediately on error to prevent UI flicker
      setError("Device unreachable");
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Initial Load & Polling
  useEffect(() => {
    if (!url) return;

    setLoading(true);
    fetchStats();

    // Poll every 5 seconds for real-time DNS updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats, url]);

  // Toggle Action
  const toggleBlocker = async () => {
    if (!url) return;
    setIsToggling(true);

    try {
      const res = await fetch(`${url}/api/adblock/toggle`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to toggle blocker");

      // Optimistic update or immediate refetch
      const data = await res.json();

      setStats((prev) => {
        if (!prev) return null;
        return { ...prev, is_enabled: data.is_enabled };
      });

      // Force a fresh fetch to ensure sync
      await fetchStats();
    } catch (err) {
      console.error("Error toggling blocker:", err);
      alert("Failed to change blocker state");
    } finally {
      setIsToggling(false);
    }
  };

  return {
    stats,
    loading,
    error,
    isToggling,
    toggleBlocker,
    refetch: fetchStats,
  };
};

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
  tx_power: "20" | "30"; // dBm
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
  usage: string; // e.g. "1.2 MB/s"
  blocked: boolean;
  limited: boolean;
}

// --- The Hook ---

export const useRouterSettings = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();

  const [config, setConfig] = useState<RouterConfig | null>(null);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;

  // 1. Initial Fetch (Config & Devices)
  const fetchData = useCallback(async () => {
    if (!url) return;
    try {
      // Fetch Config
      const configRes = await fetch(`${url}/api/router/config`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      // Fetch Devices
      const devicesRes = await fetch(`${url}/api/router/devices`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDevices(devicesData);
      }
    } catch (err) {
      console.error("Failed to fetch router settings:", err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Poll for Live Traffic / Device Status
  useEffect(() => {
    if (!url || loading) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${url}/api/router/devices`, {
          method: "GET",
          signal: AbortSignal.timeout(4000), // Short timeout for polling
        });
        if (res.ok) {
          const data = await res.json();
          setDevices(data);
        }
      } catch (err) {
        // Silent fail on polling errors to not disrupt UI
        console.warn("Polling devices failed", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [url, loading]);

  // 3. Generic Config Updater (Local State Only)
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

  // 4. Port Forwarding Logic (Local State Only)
  const addPortRule = (rule: Omit<PortRule, "id">) => {
    setConfig((prev) => {
      if (!prev) return null;
      setHasChanges(true);
      return {
        ...prev,
        port_rules: [
          ...prev.port_rules,
          { ...rule, id: Math.random().toString() }, // Temp ID until saved
        ],
      };
    });
  };

  const removePortRule = (id: string) => {
    setConfig((prev) => {
      if (!prev) return null;
      setHasChanges(true);
      return {
        ...prev,
        port_rules: prev.port_rules.filter((r) => r.id !== id),
      };
    });
  };

  // 5. Device Blocking (Immediate API Call)
  // We don't wait for "Save" to block a user; it happens immediately.
  const toggleBlockDevice = async (
    mac: string,
    currentBlockStatus: boolean
  ) => {
    // Optimistic UI Update
    setDevices((prev) =>
      prev.map((d) =>
        d.mac === mac ? { ...d, blocked: !currentBlockStatus } : d
      )
    );

    try {
      await fetch(`${url}/api/router/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mac: mac,
          block: !currentBlockStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle block status:", err);
      // Revert on failure
      setDevices((prev) =>
        prev.map((d) =>
          d.mac === mac ? { ...d, blocked: currentBlockStatus } : d
        )
      );
    }
  };

  // 6. Device Limiting (Immediate API Call - Placeholder)
  const toggleLimitDevice = async (
    mac: string,
    currentLimitStatus: boolean
  ) => {
    // Optimistic Update
    setDevices((prev) =>
      prev.map((d) =>
        d.mac === mac ? { ...d, limited: !currentLimitStatus } : d
      )
    );

    // Note: You need to add /api/router/limit to your Go backend to support this fully
    // For now, we just update the UI state.
    console.log("Limit toggled for", mac);
  };

  // 7. Save Changes (POST Config)
  const saveChanges = async () => {
    if (!config || !url) return;
    setSaving(true);

    try {
      const res = await fetch(`${url}/api/router/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Failed to save config");

      setHasChanges(false);
      console.log("Configuration saved successfully");
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Failed to save settings to the router.");
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
    toggleLimitDevice,
    saveChanges,
  };
};

export interface Deployment {
  id: string;
  commit: string;
  message: string;
  status: "success" | "building" | "failed";
  timestamp: string;
}

export interface HostingConfig {
  domain: string;
  repo: string;
  branch: string;
  php_version: string;
  ssl_enabled: boolean;
  maintenance_mode: boolean;
  caching_enabled: boolean;
  db_name: string;
  db_size: string;
  storage_used: number; // GB
  storage_limit: number; // GB
}

export interface SiteHealth {
  cpu_usage: number; // %
  ram_usage: number; // %
  requests_per_sec: number;
  response_time: number; // ms
}

// --- Mock Data ---
const MOCK_Hosting_CONFIG: HostingConfig = {
  domain: "my-awesome-shop.com",
  repo: "github.com/alex/shop-frontend",
  branch: "main",
  php_version: "8.2",
  ssl_enabled: true,
  maintenance_mode: false,
  caching_enabled: true,
  db_name: "shop_prod_db",
  db_size: "145 MB",
  storage_used: 4.2,
  storage_limit: 20,
};

const MOCK_DEPLOYMENTS: Deployment[] = [
  {
    id: "dep_1",
    commit: "a1b2c3d",
    message: "Fix checkout bug",
    status: "success",
    timestamp: "2 hours ago",
  },
  {
    id: "dep_2",
    commit: "98z7y6x",
    message: "Update homepage hero",
    status: "success",
    timestamp: "1 day ago",
  },
  {
    id: "dep_3",
    commit: "4d5e6f7",
    message: "Add analytics",
    status: "failed",
    timestamp: "3 days ago",
  },
];

export const useWebHosting = () => {
  const [config, setConfig] = useState<HostingConfig | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [health, setHealth] = useState<SiteHealth>({
    cpu_usage: 12,
    ram_usage: 45,
    requests_per_sec: 24,
    response_time: 120,
  });
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  // Initial Fetch
  useEffect(() => {
    setTimeout(() => {
      setConfig(MOCK_Hosting_CONFIG);
      setDeployments(MOCK_DEPLOYMENTS);
      setLoading(false);
    }, 1000);
  }, []);

  // Simulate Live Resource Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth((prev) => ({
        cpu_usage: Math.max(
          5,
          Math.min(90, prev.cpu_usage + (Math.random() * 10 - 5))
        ),
        ram_usage: Math.max(
          20,
          Math.min(80, prev.ram_usage + (Math.random() * 5 - 2.5))
        ),
        requests_per_sec: Math.floor(Math.random() * 50),
        response_time: Math.floor(Math.random() * 200 + 50),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const toggleSetting = (key: keyof HostingConfig) => {
    setConfig((prev) => (prev ? { ...prev, [key]: !prev[key] } : null));
  };

  const triggerDeploy = async () => {
    setIsDeploying(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2500));

    const newDep: Deployment = {
      id: `dep_${Math.random()}`,
      commit: "HEAD",
      message: "Manual Deployment",
      status: "success",
      timestamp: "Just now",
    };

    setDeployments((prev) => [newDep, ...prev]);
    setIsDeploying(false);
  };

  const clearCache = async () => {
    // Simulate cache clear
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Cache cleared");
  };

  return {
    config,
    deployments,
    health,
    loading,
    isDeploying,
    toggleSetting,
    triggerDeploy,
    clearCache,
  };
};
