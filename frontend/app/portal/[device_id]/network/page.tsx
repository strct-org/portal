"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Wifi,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePortal } from "@/providers/PortalProvider";
import { formatDistanceToNow } from "date-fns";

// --- Types based on your Go struct ---
interface MonitorStats {
  latency: number | null; // ms
  loss: number | null; // %
  is_down: boolean | null;
  bandwidth: number | null; // Mbps
  timestamp: string;
}

// Mock data to initialize (prevents empty charts before first fetch)
const MOCK_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (20 - i) * 30000).toISOString(),
  latency: 15 + Math.random() * 10,
  bandwidth: null,
}));

export default function NetworkMonitor() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading: portalLoading } = usePortal();

  const deviceId = params.device_id as string;
  const device = devices?.find((d) => d?.id === deviceId);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [history, setHistory] = useState<MonitorStats[]>([]);
  const [latestStats, setLatestStats] = useState<MonitorStats | null>(null);

  // Derived state for the last known bandwidth (since it updates rarely)
  const lastKnownBandwidth = useMemo(() => {
    // 1. Check latest stats
    if (latestStats?.bandwidth)
      return { val: latestStats.bandwidth, time: latestStats.timestamp };

    // 2. Look back through history
    const found = [...history]
      .reverse()
      .find((h) => h.bandwidth !== null && h.bandwidth !== undefined);
    return found
      ? { val: found.bandwidth, time: found.timestamp }
      : { val: 0, time: new Date().toISOString() };
  }, [latestStats, history]);

  const fetchData = useCallback(async () => {
    if (!device) return;

    try {
      // In a real scenario, this endpoint returns { current: {}, history: [] }
      // The Go code pushes updates; the API should store them in a time-series DB.
      const res = await fetch(
        `https://${device.id}.strct.org/api/network/stats`
      );

      // Fallback for demo purposes if API isn't ready
      if (!res.ok) {
        // Simulating data arrival
        const newPoint = {
          timestamp: new Date().toISOString(),
          latency: 20 + Math.random() * 15, // random ms
          loss: Math.random() > 0.95 ? 2.0 : 0, // rare packet loss
          is_down: false,
          bandwidth: Math.random() > 0.9 ? 150 : null, // occasional bandwidth update
        };

        setHistory((prev) => {
          const newHist = [...prev, newPoint];
          return newHist.slice(-50); // Keep last 50 points
        });
        setLatestStats(newPoint);
        return;
      }

      const data = await res.json();
      setLatestStats(data.current);
      setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setIsLoading(false);
    }
  }, [device]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRunSpeedtest = async () => {
    if (!device) return;
    setIsRunningTest(true);
    try {
      // Trigger the Go function manual override
      await fetch(`https://${device.id}.strct.org/api/network/speedtest`, {
        method: "POST",
      });
      // Poll faster for result
      setTimeout(fetchData, 2000);
      setTimeout(fetchData, 5000);
    } catch (e) {
      alert("Failed to trigger speedtest");
    } finally {
      setTimeout(() => setIsRunningTest(false), 10000); // cooldown UI
    }
  };

  // Helper for status color
  const getLatencyColor = (ms: number | null) => {
    if (!ms) return "text-gray-400";
    if (ms < 50) return "text-green-500";
    if (ms < 150) return "text-yellow-500";
    return "text-red-500";
  };

  if (portalLoading || !device) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f]">
      <main className="pt-28 px-6 pb-12 max-w-[1200px] mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] flex items-center gap-3">
                Network Monitor
                {latestStats?.is_down ? (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full uppercase tracking-wide">
                    Offline
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                )}
              </h1>
              <p className="text-gray-500 mt-1">
                Real-time latency and bandwidth metrics from{" "}
                {device.friendly_name}
              </p>
            </div>

            <button
              onClick={handleRunSpeedtest}
              disabled={isRunningTest}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1d1d1f] hover:bg-black text-white font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isRunningTest ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Activity size={18} />
              )}
              {isRunningTest ? "Testing..." : "Run Speedtest"}
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Latency Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div
                  className={`font-bold text-sm ${getLatencyColor(
                    latestStats?.latency || 0
                  )}`}
                >
                  {latestStats?.latency
                    ? latestStats.latency < 50
                      ? "Good"
                      : "Poor"
                    : "--"}
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-gray-500 text-sm font-medium">Latency</div>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1">
                  {latestStats?.latency ? latestStats.latency.toFixed(1) : "--"}
                  <span className="text-lg text-gray-400 font-medium ml-1">
                    ms
                  </span>
                </div>
              </div>
              {/* Background Chart Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                {/* Decorative mini chart */}
                <svg
                  viewBox="0 0 100 20"
                  className="w-full h-full fill-green-500"
                >
                  <path d="M0,20 L0,10 C10,12 20,5 30,10 C40,15 50,8 60,12 C70,16 80,10 90,14 L100,10 L100,20 Z" />
                </svg>
              </div>
            </div>

            {/* Bandwidth Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Wifi size={24} />
                </div>
                <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(lastKnownBandwidth.time))} ago
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">
                  Download Speed
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1">
                  {lastKnownBandwidth.val
                    ? lastKnownBandwidth.val.toFixed(1)
                    : "--"}
                  <span className="text-lg text-gray-400 font-medium ml-1">
                    Mbps
                  </span>
                </div>
              </div>
            </div>

            {/* Packet Loss / Health Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    latestStats?.loss && latestStats.loss > 0
                      ? "bg-red-50 text-red-500"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  {latestStats?.loss && latestStats.loss > 0 ? (
                    <AlertTriangle size={24} />
                  ) : (
                    <Server size={24} />
                  )}
                </div>
                {latestStats?.loss === 0 && (
                  <CheckCircle2 size={20} className="text-green-500" />
                )}
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">
                  Packet Loss
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1">
                  {latestStats?.loss ? latestStats.loss.toFixed(1) : "0"}
                  <span className="text-lg text-gray-400 font-medium ml-1">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CHART SECTION */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f]">
                  Latency History
                </h3>
                <p className="text-sm text-gray-500">
                  Response time to 8.8.8.8 over the last hour
                </p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>{" "}
                  Latency (ms)
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.length > 0 ? history : MOCK_HISTORY}>
                  <defs>
                    <linearGradient
                      id="colorLatency"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(str: string) =>
                      new Date(str).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    unit=" ms"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "#6b7280", marginBottom: "0.5rem" }}
                    itemStyle={{ fontWeight: "bold", color: "#1d1d1f" }}
                    formatter={(value: any) => [
                      `${value.toFixed(1)} ms`,
                      "Latency",
                    ]}
                    labelFormatter={(label ) =>
                      new Date(label).toLocaleTimeString()
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorLatency)"
                    isAnimationActive={false} // Disable animation for real-time updates to prevent jitter
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
