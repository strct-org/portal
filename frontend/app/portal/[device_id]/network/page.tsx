"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Wifi,
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
import { useDeviceNetworkStats } from "@/api.device";

// --- Types ---
interface MonitorStats {
  latency: number | null; // ms
  loss: number | null; // %
  is_down: boolean | null;
  bandwidth: number | null; // Mbps
  timestamp: string;
}

type ChartType = "latency" | "bandwidth" | "loss";

// Mock data initialized with occasional bandwidth/loss for visualization
const MOCK_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (20 - i) * 30000).toISOString(),
  latency: 15 + Math.random() * 10,
  loss: Math.random() > 0.8 ? Math.random() * 2 : 0,
  // Simulate bandwidth appearing only every 5th point
  bandwidth: i % 5 === 0 ? 100 + Math.random() * 50 : null,
}));

export default function NetworkMonitor() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading: portalLoading } = usePortal();

  const deviceId = params.device_id as string;
  const device = devices?.find((d) => d?.id === deviceId);
  const { stats } = useDeviceNetworkStats(deviceId);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // 1. New State for tracking which chart is active
  const [activeChart, setActiveChart] = useState<ChartType>("latency");

  const [history, setHistory] = useState<MonitorStats[]>([]);
  const [latestStats, setLatestStats] = useState<MonitorStats | null>(null);

  // Derived state for the last known bandwidth
  const lastKnownBandwidth = useMemo(() => {
    if (latestStats?.bandwidth)
      return { val: latestStats.bandwidth, time: latestStats.timestamp };

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
      const res = await fetch(
        `https://${device.id}.strct.org/api/network/stats` //! call to
      );
      // const res = await apiService.getDeviceNetworkStats(device.id);

      if (!res.ok) {
        // Simulation fallback
        const newPoint = {
          timestamp: new Date().toISOString(),
          latency: 20 + Math.random() * 15,
          loss: Math.random() > 0.95 ? 2.0 : 0,
          is_down: false,
          bandwidth: Math.random() > 0.9 ? 150 : null,
        };

        setHistory((prev) => {
          const newHist = [...prev, newPoint];
          return newHist.slice(-50);
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRunSpeedtest = async () => {
    if (!device) return;
    setIsRunningTest(true);
    // Auto-switch to bandwidth chart so user sees result
    setActiveChart("bandwidth");
    console.log(`https://${device.id}.strct.org/api/network/speedtest`);

    try {
      await fetch(`https://${device.id}.strct.org/api/network/speedtest`, {
        method: "GET",
      });
    } catch (e) {
      alert("Failed to trigger speedtest");
    } finally {
      setTimeout(() => setIsRunningTest(false), 10);
    }
  };

  const getLatencyColor = (ms: number | null) => {
    if (!ms) return "text-gray-400";
    if (ms < 50) return "text-green-500";
    if (ms < 150) return "text-yellow-500";
    return "text-red-500";
  };

  // 2. Configuration helper for the dynamic chart
  const chartConfig = {
    latency: {
      title: "Latency History",
      description: "Response time to 8.8.8.8 over the last hour",
      dataKey: "latency",
      color: "#22c55e", // Green
      unit: "ms",
      gradientId: "colorLatency",
    },
    bandwidth: {
      title: "Download Speed History",
      description: "Speedtest results over time",
      dataKey: "bandwidth",
      color: "#3b82f6", // Blue
      unit: "Mbps",
      gradientId: "colorBandwidth",
    },
    loss: {
      title: "Packet Loss History",
      description: "Percentage of dropped packets over time",
      dataKey: "loss",
      color: "#ef4444", // Red
      unit: "%",
      gradientId: "colorLoss",
    },
  };

  const currentConfig = chartConfig[activeChart];

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

          {/* KPI CARDS - Now Clickable Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1. Latency Card */}
            <button
              onClick={() => setActiveChart("latency")}
              className={`text-left transition-all duration-200 bg-white p-6 rounded-[2rem] shadow-sm relative overflow-hidden group
                ${
                  activeChart === "latency"
                    ? "ring-2 ring-green-500 ring-offset-2"
                    : "border border-gray-100 hover:border-green-200 hover:shadow-md"
                }
              `}
            >
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
              {/* Decorative mini chart background */}
              <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg
                  viewBox="0 0 100 20"
                  className="w-full h-full fill-green-500"
                >
                  <path d="M0,20 L0,10 C10,12 20,5 30,10 C40,15 50,8 60,12 C70,16 80,10 90,14 L100,10 L100,20 Z" />
                </svg>
              </div>
            </button>

            {/* 2. Bandwidth Card */}
            <button
              onClick={() => setActiveChart("bandwidth")}
              className={`text-left transition-all duration-200 bg-white p-6 rounded-[2rem] shadow-sm
                ${
                  activeChart === "bandwidth"
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "border border-gray-100 hover:border-blue-200 hover:shadow-md"
                }
              `}
            >
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
            </button>

            {/* 3. Packet Loss Card */}
            <button
              onClick={() => setActiveChart("loss")}
              className={`text-left transition-all duration-200 bg-white p-6 rounded-[2rem] shadow-sm
                ${
                  activeChart === "loss"
                    ? "ring-2 ring-red-500 ring-offset-2"
                    : "border border-gray-100 hover:border-red-200 hover:shadow-md"
                }
              `}
            >
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
            </button>
          </div>

          {/* MAIN DYNAMIC CHART SECTION */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <motion.h3
                  key={currentConfig.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold text-[#1d1d1f]"
                >
                  {currentConfig.title}
                </motion.h3>
                <motion.p
                  key={currentConfig.description}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500"
                >
                  {currentConfig.description}
                </motion.p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: currentConfig.color }}
                  ></span>
                  {currentConfig.dataKey === "latency" && "Latency (ms)"}
                  {currentConfig.dataKey === "bandwidth" && "Speed (Mbps)"}
                  {currentConfig.dataKey === "loss" && "Loss (%)"}
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
                    <linearGradient
                      id="colorBandwidth"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                    unit={` ${currentConfig.unit}`}
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
                      `${Number(value).toFixed(1)} ${currentConfig.unit}`,
                      currentConfig.title.split(" ")[0], // Simpler label in tooltip
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleTimeString()
                    }
                  />

                  <Area
                    key={activeChart}
                    type="monotone"
                    dataKey={currentConfig.dataKey}
                    stroke={currentConfig.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#${currentConfig.gradientId})`}
                    isAnimationActive={true}
                    connectNulls={true}
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
