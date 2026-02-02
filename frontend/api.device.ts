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
