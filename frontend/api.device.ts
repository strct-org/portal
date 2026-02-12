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
