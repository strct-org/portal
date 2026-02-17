"use client";
import { usePortal } from "@/providers/PortalProvider";

import { useState, useEffect, useMemo, useCallback } from "react";

export interface DeviceLiveStats {
  isOnline: boolean;
  storageUsed: number;
  storageTotal: number;
  ipAddress?: string;
  uptime?: number;
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
            signal: AbortSignal.timeout(3000),
          });
          if (!res.ok) throw new Error("Offline");
          const data = await res.json();
          return {
            id: device.id,
            data: {
              isOnline: true,
              storageUsed: data.used,
              storageTotal: data.total,
              ipAddress: data.ip,
              uptime: data.uptime,
            } as DeviceLiveStats,
          };
        } catch {
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
      const results = await Promise.all(promises);
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
