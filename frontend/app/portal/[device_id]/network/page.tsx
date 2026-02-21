"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Wifi,
  AlertTriangle,
  RefreshCw,
  Server,
  Download,
  FileText,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MonitorStats {
  latency: number | null; // ms
  loss: number | null; // %
  is_down: boolean | null;
  bandwidth: number | null; // Mbps
  timestamp: string;
}

type ChartType = "latency" | "bandwidth" | "loss";
type TimeRange = "24h" | "7d" | "30d" | "custom";

// Helper type for jspdf-autotable extension
type jsPDFWithAutoTable = jsPDF & {
  lastAutoTable: {
    finalY: number;
  };
};

export default function NetworkMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading: portalLoading } = usePortal();

  const deviceId = params.device_id as string;
  const device = devices?.find((d) => d?.id === deviceId);

  const {
    stats: deviceStats,
    loading: statsLoading,
    refetch,
  } = useDeviceNetworkStats(deviceId);

  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeChart, setActiveChart] = useState<ChartType>("latency");

  const [exportRange, setExportRange] = useState<TimeRange>("24h");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState<ChartType | null>(null);

  const [history, setHistory] = useState<MonitorStats[]>([]);
  const [activeStats, setActiveStats] = useState<MonitorStats | null>(null);

  const lastBandwidthRef = useRef<number | null>(null);
  const initialTestDone = useRef(false);

  useEffect(() => {
    if (deviceStats) {
      if (
        deviceStats.bandwidth !== null &&
        deviceStats.bandwidth !== undefined
      ) {
        lastBandwidthRef.current = deviceStats.bandwidth;
      }

      const effectiveBandwidth =
        deviceStats.bandwidth !== null && deviceStats.bandwidth !== undefined
          ? deviceStats.bandwidth
          : lastBandwidthRef.current;

      const newPoint: MonitorStats = {
        latency: deviceStats.latency,
        loss: deviceStats.loss,
        is_down: deviceStats.isDown,
        bandwidth: effectiveBandwidth,
        timestamp: deviceStats.timestamp || new Date().toISOString(),
      };

      setActiveStats(newPoint);

      setHistory((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].timestamp === newPoint.timestamp
        ) {
          return prev;
        }

        const newHist = [...prev, newPoint];
        return newHist.slice(-50);
      });
    }
  }, [deviceStats]);

  const handleRunSpeedtest = async () => {
    if (!device) return;
    setIsRunningTest(true);
    setActiveChart("bandwidth");

    try {
      await fetch(`https://${device.id}.strct.org/api/network/speedtest`, {
        method: "GET",
      });
      refetch();
    } catch (e) {
      alert("Failed to trigger speedtest");
    } finally {
      setTimeout(() => setIsRunningTest(false), 2000);
    }
  };

  useEffect(() => {
    if (device && !initialTestDone.current) {
      handleRunSpeedtest();
      initialTestDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const fetchDetailedHistory = async (
    range: TimeRange,
    customStart?: string
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let startDate = new Date();
    let intervalMinutes = 5;

    switch (range) {
      case "24h":
        startDate = subHours(new Date(), 24);
        intervalMinutes = 15;
        break;
      case "7d":
        startDate = subDays(new Date(), 7);
        intervalMinutes = 60;
        break;
      case "30d":
        startDate = subDays(new Date(), 30);
        intervalMinutes = 240;
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

    while (current <= endDate) {
      mockData.push({
        timestamp: current.toISOString(),
        latency: 10 + Math.random() * 30 + (Math.random() > 0.9 ? 100 : 0),
        loss: Math.random() > 0.95 ? Math.random() * 5 : 0,
        is_down: false,
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
      const data = await fetchDetailedHistory(exportRange, customStartDate);

      const filteredData = data.filter((d) => {
        if (type === "bandwidth") return d.bandwidth !== null;
        return true;
      });

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

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Network Performance Report", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Device: ${device.friendly_name || device.id}`, 14, 30);
      doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 36);

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(
        `${type.charAt(0).toUpperCase() + type.slice(1)} History (${
          exportRange === "custom" ? "Custom Range" : "Last " + exportRange
        })`,
        14,
        50
      );

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

      const finalY = (doc as jsPDFWithAutoTable).lastAutoTable.finalY;

      doc.text("Detailed Logs", 14, finalY + 15);

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
        startY: finalY + 20,
        head: [["Timestamp", "Value", "Status"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor:
            type === "loss"
              ? [248, 113, 113]
              : type === "bandwidth"
              ? [123, 140, 222]
              : [74, 222, 128],
        },
      });

      doc.save(`${device.id}_${type}_report.pdf`);
    } catch (error) {
      console.error("PDF Generation Error", error);
      alert("Failed to generate report");
    } finally {
      setIsExporting(null);
    }
  };

  const chartConfig = {
    latency: {
      title: "Latency Over Time",
      description: "Response time to public DNS (8.8.8.8)",
      dataKey: "latency",
      color: "#4ade80", // Green
      unit: "ms",
      gradientId: "colorLatency",
    },
    bandwidth: {
      title: "Throughput (Speedtest)",
      description: "Intermittent bandwidth capacity checks",
      dataKey: "bandwidth",
      color: "#7b8cde", // Accent Blue
      unit: "Mbps",
      gradientId: "colorBandwidth",
    },
    loss: {
      title: "Packet Loss",
      description: "Percentage of dropped ICMP packets",
      dataKey: "loss",
      color: "#f87171", // Red
      unit: "%",
      gradientId: "colorLoss",
    },
  };

  const currentConfig = chartConfig[activeChart];

  if (portalLoading || !device) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center font-mono">
        <div className="animate-spin text-[#7b8cde]">
          <RefreshCw size={24} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#080810] text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      {/* Header */}
      <header className="border-b border-[#151520] sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/portal/dashboard")}
              className="text-[#444] hover:text-[#888] transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase text-[#7b8cde]">
                Network Monitor
              </h1>
              <p className="text-[10px] text-[#333] mt-0.5">
                {device.friendly_name || "Orange Pi"} · {deviceId?.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Live status pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-bold ${
              activeStats?.is_down
                ? "bg-[#1a0a0a] border-[#4a1a1a] text-[#f87171]"
                : "bg-[#0a1a0a] border-[#1a4a1a] text-[#4ade80]"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                activeStats?.is_down
                  ? "bg-[#f87171]"
                  : statsLoading
                  ? "bg-[#4ade80]/50"
                  : "bg-[#4ade80] animate-pulse"
              }`}
            />
            {activeStats?.is_down
              ? "Offline"
              : statsLoading
              ? "Updating..."
              : "Live"}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* KPI Cards */}
        <div>
          <p className="text-[10px] text-[#333] uppercase tracking-widest mb-4">
            Select Metric to View
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <KPIButton
              active={activeChart === "latency"}
              onClick={() => setActiveChart("latency")}
              icon={<Activity size={20} />}
              title="Latency"
              value={
                activeStats?.latency ? activeStats.latency.toFixed(1) : "--"
              }
              unit="ms"
              status={
                activeStats?.latency
                  ? activeStats.latency < 50
                    ? "Optimal"
                    : "Degraded"
                  : "--"
              }
              color="green"
            />
            <KPIButton
              active={activeChart === "bandwidth"}
              onClick={() => setActiveChart("bandwidth")}
              icon={<Wifi size={20} />}
              title="Download Speed"
              value={
                activeStats?.bandwidth ? activeStats.bandwidth.toFixed(1) : "--"
              }
              unit="Mbps"
              status={
                activeStats?.timestamp
                  ? formatDistanceToNow(new Date(activeStats.timestamp)) + " ago"
                  : "Unknown"
              }
              color="blue"
            />
            <KPIButton
              active={activeChart === "loss"}
              onClick={() => setActiveChart("loss")}
              icon={
                activeStats?.loss && activeStats.loss > 0 ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Server size={20} />
                )
              }
              title="Packet Loss"
              value={activeStats?.loss ? activeStats.loss.toFixed(1) : "0"}
              unit="%"
              status={
                activeStats?.loss === 0
                  ? "Zero Loss"
                  : activeStats?.loss
                  ? "Warning"
                  : "--"
              }
              color="red"
            />
          </div>
        </div>

        {/* Action Bar (Speedtest + Export) */}
        <Section title="Diagnostics & Export" sub="Execute manual checks or export historical traffic logs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <button
              onClick={handleRunSpeedtest}
              disabled={isRunningTest}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] font-bold py-2.5 px-5 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {isRunningTest ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Terminal size={14} />
              )}
              {isRunningTest ? "Running Test..." : "Run Speedtest"}
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={exportRange}
                  onChange={(e) => setExportRange(e.target.value as TimeRange)}
                  className="bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-3 py-2 text-xs font-mono text-[#dde1f0] outline-none transition-colors"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="custom">Custom Date</option>
                </select>
                {exportRange === "custom" && (
                  <input
                    type="date"
                    className="bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-2 py-1.5 text-xs font-mono text-[#dde1f0] outline-none transition-colors"
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                )}
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <ExportButton
                  label="Lat PDF"
                  onClick={() => generatePDF("latency")}
                  isLoading={isExporting === "latency"}
                  color="green"
                />
                <ExportButton
                  label="Spd PDF"
                  onClick={() => generatePDF("bandwidth")}
                  isLoading={isExporting === "bandwidth"}
                  color="blue"
                />
                <ExportButton
                  label="Loss PDF"
                  onClick={() => generatePDF("loss")}
                  isLoading={isExporting === "loss"}
                  color="red"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Chart Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-5"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentConfig.color }}
                  />
                  {currentConfig.title}
                </h3>
                <p className="text-[10px] text-[#333] font-mono mt-0.5">
                  {currentConfig.description}
                </p>
              </div>
            </div>

            <div className="h-[350px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.length > 0 ? history : []}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7b8cde" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7b8cde" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#151522"
                  />

                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(str: string) =>
                      new Date(str).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    stroke="#444"
                    tick={{ fontSize: 10, fill: "#555" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />

                  <YAxis
                    stroke="#444"
                    tick={{ fontSize: 10, fill: "#555" }}
                    tickLine={false}
                    axisLine={false}
                    unit={` ${currentConfig.unit}`}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0c0c16",
                      borderColor: "#1a1a28",
                      borderRadius: "12px",
                      color: "#dde1f0",
                      fontFamily: "inherit",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#555", marginBottom: "4px" }}
                    itemStyle={{ fontWeight: "bold", color: currentConfig.color }}
                    formatter={(value: number) => [
                      `${Number(value).toFixed(1)} ${currentConfig.unit}`,
                      currentConfig.title.split(" ")[0],
                    ]}
                    labelFormatter={(label: string) =>
                      new Date(label).toLocaleTimeString()
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey={currentConfig.dataKey}
                    stroke={currentConfig.color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${currentConfig.gradientId})`}
                    isAnimationActive={true}
                    connectNulls={true}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {history.length === 0 && !statsLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[10px] text-[#444] uppercase tracking-widest">
                    Awaiting Telemetry...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


interface KPIButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit: string;
  status?: string;
  color: string;
}

function KPIButton({
  active,
  onClick,
  icon,
  title,
  value,
  unit,
  status,
  color,
}: KPIButtonProps) {
  const colors: Record<string, string> = {
    green: "border-[#4ade80]/50 bg-[#0a1a0a] shadow-[0_0_30px_rgba(74,222,128,0.06)]",
    blue: "border-[#7b8cde]/50 bg-[#0a0c1a] shadow-[0_0_30px_rgba(123,140,222,0.06)]",
    red: "border-[#f87171]/50 bg-[#1a0a0a] shadow-[0_0_30px_rgba(248,113,113,0.06)]",
  };
  
  const inactive = "border-[#151520] bg-[#0c0c14] hover:border-[#252535]";
  const activeColor =
    color === "green"
      ? "text-[#4ade80]"
      : color === "blue"
      ? "text-[#7b8cde]"
      : "text-[#f87171]";

  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all ${
        active ? colors[color] : inactive
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={active ? activeColor : "text-[#444]"}>{icon}</div>
        <div
          className={`text-[9px] uppercase tracking-widest font-bold ${
            active ? activeColor : "text-[#444]"
          }`}
        >
          {status}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-[#555] uppercase tracking-widest mb-1">
          {title}
        </div>
        <div className="text-2xl font-bold text-[#dde1f0]">
          {value} <span className="text-sm text-[#444] font-normal">{unit}</span>
        </div>
      </div>
    </button>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="p-2 bg-[#0a0a14] rounded-lg text-[#555]">
          <FileText size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#dde1f0]">{title}</h3>
          <p className="text-[10px] text-[#444] font-mono mt-0.5">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

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
  const accents: Record<string, string> = {
    green: "hover:bg-[#4ade80]/10 hover:text-[#4ade80] hover:border-[#4ade80]/30",
    blue: "hover:bg-[#7b8cde]/10 hover:text-[#7b8cde] hover:border-[#7b8cde]/30",
    red: "hover:bg-[#f87171]/10 hover:text-[#f87171] hover:border-[#f87171]/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-3 py-2 text-[11px] uppercase tracking-widest font-bold rounded-lg border border-[#1a1a28] transition-all flex items-center gap-2 bg-[#0e0e1a] text-[#888] ${
        accents[color]
      } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
    >
      {isLoading ? (
        <RefreshCw size={12} className="animate-spin" />
      ) : (
        <Download size={12} />
      )}
      {label}
    </button>
  );
}