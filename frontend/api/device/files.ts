"use client";

import { useState, useEffect } from "react";
import { useDeviceUrls } from "./core";

export interface FileItem {
  name: string;
  size: string;
  type: "file" | "folder";
  modifiedAt: string;
}

export const useDeviceFiles = (selectedDeviceId: string | null) => {
  const urls = useDeviceUrls();
  const url = selectedDeviceId ? urls[selectedDeviceId] : null;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${url}/api/files`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setFiles(data.files || []);
      } catch {
        setError("Device unreachable");
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [url]);

  return { files, loading, error };
};
