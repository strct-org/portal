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
  Download,
  Calendar,
  FileText,
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
import { formatDistanceToNow, subDays, subHours, format } from "date-fns";
import { useDeviceNetworkStats } from "@/api.device";
// Import PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Types ---
interface MonitorStats {
  latency: number | null; // ms
  loss: number | null; // %
  is_down: boolean | null;
  bandwidth: number | null; // Mbps
  timestamp: string;
}

type ChartType = "latency" | "bandwidth" | "loss";
type TimeRange = "24h" | "7d" | "30d" | "custom";

// Mock data initialized for visualization
const MOCK_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (20 - i) * 30000).toISOString(),
  latency: 15 + Math.random() * 10,
  loss: Math.random() > 0.8 ? Math.random() * 2 : 0,
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
  const [activeChart, setActiveChart] = useState<ChartType>("latency");

  // --- Export State ---
  const [exportRange, setExportRange] = useState<TimeRange>("24h");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState<ChartType | null>(null);

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

  // --- Data Fetching (Live) ---
  const fetchData = useCallback(async () => {
    if (!device) return;

    try {
      // Replace with your actual API call
      const res = await fetch(
        `https://${device.id}.strct.org/api/network/stats`
      );

      if (!res.ok) {
        // Simulation fallback for live data
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
    setActiveChart("bandwidth");

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

  // --- PDF & Historical Data Logic ---

  /**
   * Simulates fetching historical data from a database.
   * In a real app, you would pass start/end dates to your API here.
   */
  const fetchDetailedHistory = async (
    range: TimeRange,
    customStart?: string
  ) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let startDate = new Date();
    let intervalMinutes = 5; // Granularity

    switch (range) {
      case "24h":
        startDate = subHours(new Date(), 24);
        intervalMinutes = 15;
        break;
      case "7d":
        startDate = subDays(new Date(), 7);
        intervalMinutes = 60; // Hourly for 7 days
        break;
      case "30d":
        startDate = subDays(new Date(), 30);
        intervalMinutes = 240; // Every 4 hours
        break;
      case "custom":
        startDate = customStart
          ? new Date(customStart)
          : subDays(new Date(), 1);
        intervalMinutes = 60;
        break;
    }

    const endDate = new Date();
    const mockData: MonitorStats[] = [];
    let current = new Date(startDate);

    // Generate realistic looking data
    while (current <= endDate) {
      mockData.push({
        timestamp: current.toISOString(),
        latency: 10 + Math.random() * 30 + (Math.random() > 0.9 ? 100 : 0), // Occasional spikes
        loss: Math.random() > 0.95 ? Math.random() * 5 : 0,
        is_down: false,
        // Bandwidth tests usually happen less frequently
        bandwidth: Math.random() > 0.8 ? 50 + Math.random() * 200 : null,
      });
      current = new Date(current.getTime() + intervalMinutes * 60000);
    }

    return mockData;
  };

  const generatePDF = async (type: ChartType) => {
    if (!device) return;
    setIsExporting(type);

    try {
      // 1. Get Data
      const data = await fetchDetailedHistory(exportRange, customStartDate);

      // 2. Filter data for the specific metric
      const filteredData = data.filter((d) => {
        if (type === "bandwidth") return d.bandwidth !== null;
        return true;
      });

      // 3. Calculate Summary Stats
      const values = filteredData.map((d) =>
        type === "latency"
          ? d.latency || 0
          : type === "bandwidth"
          ? d.bandwidth || 0
          : d.loss || 0
      );

      const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
      const max = Math.max(...values, 0);
      const min = Math.min(...values, 0);

      // 4. Create PDF
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text("Network Performance Report", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Device: ${device.friendly_name || device.id}`, 14, 30);
      doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 36);

      // Metric Title
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(
        `${type.charAt(0).toUpperCase() + type.slice(1)} History (${
          exportRange === "custom" ? "Custom Range" : "Last " + exportRange
        })`,
        14,
        50
      );

      // Summary Box
      const unit =
        type === "latency" ? "ms" : type === "bandwidth" ? "Mbps" : "%";

      const summaryData = [
        ["Average", "Maximum", "Minimum", "Samples"],
        [
          `${avg.toFixed(2)} ${unit}`,
          `${max.toFixed(2)} ${unit}`,
          `${min.toFixed(2)} ${unit}`,
          values.length.toString(),
        ],
      ];

      autoTable(doc, {
        startY: 55,
        head: [summaryData[0]],
        body: [summaryData[1]],
        theme: "grid",
        headStyles: { fillColor: [29, 29, 31] },
      });

      // Detailed Data Table
      doc.text("Detailed Logs", 14, (doc as any).lastAutoTable.finalY + 15);

      const tableRows = filteredData.map((item) => [
        format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss"),
        type === "latency"
          ? `${item.latency?.toFixed(1)} ms`
          : type === "bandwidth"
          ? `${item.bandwidth?.toFixed(1)} Mbps`
          : `${item.loss?.toFixed(2)} %`,
        item.is_down ? "Offline" : "Online",
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Timestamp", "Value", "Status"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor:
            type === "loss"
              ? [239, 68, 68]
              : type === "bandwidth"
              ? [59, 130, 246]
              : [34, 197, 94],
        },
      });

      // Save
      doc.save(`${device.id}_${type}_report.pdf`);
    } catch (error) {
      console.error("PDF Generation Error", error);
      alert("Failed to generate report");
    } finally {
      setIsExporting(null);
    }
  };

  const getLatencyColor = (ms: number | null) => {
    if (!ms) return "text-gray-400";
    if (ms < 50) return "text-green-500";
    if (ms < 150) return "text-yellow-500";
    return "text-red-500";
  };

  const chartConfig = {
    latency: {
      title: "Latency History",
      description: "Response time to 8.8.8.8 over the last hour",
      dataKey: "latency",
      color: "#22c55e",
      unit: "ms",
      gradientId: "colorLatency",
    },
    bandwidth: {
      title: "Download Speed History",
      description: "Speedtest results over time",
      dataKey: "bandwidth",
      color: "#3b82f6",
      unit: "Mbps",
      gradientId: "colorBandwidth",
    },
    loss: {
      title: "Packet Loss History",
      description: "Percentage of dropped packets over time",
      dataKey: "loss",
      color: "#ef4444",
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

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Latency Card */}
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
            </button>

            {/* Bandwidth Card */}
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

            {/* Packet Loss Card */}
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

          {/* --- EXPORT HISTORY SECTION (NEW) --- */}
          <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1d1d1f]">
                  Export Reports
                </h4>
                <p className="text-xs text-gray-500">
                  Download PDF history logs
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Time Range Selector */}
              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                <select
                  className="bg-transparent text-sm font-medium text-gray-700 px-2 py-1 outline-none cursor-pointer"
                  value={exportRange}
                  onChange={(e) => setExportRange(e.target.value as TimeRange)}
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="custom">Start From Date</option>
                </select>
                {exportRange === "custom" && (
                  <input
                    type="date"
                    className="ml-2 bg-white rounded border border-gray-200 text-sm px-2 py-0.5 outline-none"
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                )}
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2">
                <ExportButton
                  label="Latency"
                  onClick={() => generatePDF("latency")}
                  isLoading={isExporting === "latency"}
                  color="green"
                />
                <ExportButton
                  label="Speed"
                  onClick={() => generatePDF("bandwidth")}
                  isLoading={isExporting === "bandwidth"}
                  color="blue"
                />
                <ExportButton
                  label="Loss"
                  onClick={() => generatePDF("loss")}
                  isLoading={isExporting === "loss"}
                  color="red"
                />
              </div>
            </div>
          </div>

          {/* MAIN CHART SECTION */}
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
                      currentConfig.title.split(" ")[0],
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

// Sub-component for buttons to keep JSX clean
function ExportButton({
  label,
  onClick,
  isLoading,
  color,
}: {
  label: string;
  onClick: () => void;
  isLoading: boolean;
  color: string;
}) {
  const colorClasses = {
    green: "hover:bg-green-50 hover:text-green-600 border-gray-200",
    blue: "hover:bg-blue-50 hover:text-blue-600 border-gray-200",
    red: "hover:bg-red-50 hover:text-red-600 border-gray-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2
        ${colorClasses[color as keyof typeof colorClasses]}
        ${isLoading ? "opacity-70 cursor-wait" : "bg-white text-gray-600"}
      `}
    >
      {isLoading ? (
        <RefreshCw size={14} className="animate-spin" />
      ) : (
        <Download size={14} />
      )}
      {label}
    </button>
  );
}
