"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Globe,
  Ban,
  Filter,
  RefreshCw,
  Terminal,
  Server
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePortal } from "@/providers/PortalProvider";
import { useDeviceAdBlockerStats } from "@/api/device";

export default function AdBlocker() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.device_id as string;

  const { devices, isLoading: portalLoading } = usePortal();
  const device = devices?.find((d) => d?.id === deviceId);

  // Use the custom hook
  const { stats, loading, isToggling, toggleBlocker } =
    useDeviceAdBlockerStats(deviceId);

  if (portalLoading || !device) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#f87171]" size={24} />
          <span className="text-[10px] text-[#555] uppercase tracking-widest">
            Interfacing with Shield Subsystem...
          </span>
        </div>
      </div>
    );
  }

  // Safe defaults if stats haven't loaded yet
  const isEnabled = stats?.is_enabled ?? false;
  const chartData = stats?.chart_data || [];
  const logs = stats?.recent_logs || [];

  return (
    <div
      className="min-h-screen bg-[#080810] text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      {/* Top Navigation Bar */}
      <header className="border-b border-[#151520] sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/portal/${deviceId}`)}
              className="text-[#444] hover:text-[#dde1f0] transition-colors flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold"
            >
              <ArrowLeft size={14} /> Hub
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#f87171]" />
              <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-[#f87171]">
                  {device.friendly_name}
                </h1>
                <p className="text-[9px] text-[#555] mt-0.5 uppercase tracking-widest">
                  Ad Blocker Subsystem
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-[#0a1a0a] border-[#1a4a1a] text-[#4ade80] text-[9px] uppercase tracking-widest font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 pb-6 border-b border-[#151522]">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-[#dde1f0] flex items-center gap-3">
                  DNS Shield
                </h2>
                {loading && !stats ? (
                  <span className="px-2 py-0.5 border border-[#333] bg-[#111] text-[#555] text-[9px] font-bold rounded-md uppercase tracking-widest">
                    Connecting
                  </span>
                ) : isEnabled ? (
                  <span className="px-2 py-0.5 border border-[#1a4a1a] bg-[#0a1a0a] text-[#4ade80] text-[9px] font-bold rounded-md uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 border border-[#3a1a1a] bg-[#1a0a0a] text-[#f87171] text-[9px] font-bold rounded-md uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert size={10} /> Suspended
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#555] uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#f87171]">{device.local_ip || "192.168.1.x"}</span>
                <span className="text-[#333]">/</span>
                Network-wide telemetry & ad mitigation
              </p>
            </div>

            {/* Main Toggle */}
            <button
              onClick={toggleBlocker}
              disabled={loading || isToggling}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border shadow-sm ${
                isEnabled
                  ? "bg-[#1a0a0a] border-[#3a1a1a] hover:border-[#f87171]/50 text-[#f87171]"
                  : "bg-[#0a1a0a] border-[#1a4a1a] hover:border-[#4ade80]/50 text-[#4ade80]"
              } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
            >
              {isToggling ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Filter size={14} />
              )}
              {isEnabled ? "Suspend Shield" : "Initialize Shield"}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Blocked Ads Card */}
            <div className="bg-[#0c0c16] p-6 rounded-2xl border border-[#1a1a28] relative overflow-hidden group hover:border-[#f87171]/40 transition-colors">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#f87171]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#f87171]/10 transition-colors" />
              <div className="flex justify-between items-start mb-5">
                <div className="p-2.5 bg-[#1a0a0a] border border-[#3a1a1a] text-[#f87171] rounded-xl">
                  <Ban size={20} />
                </div>
                <div className="text-[#4ade80] text-[9px] font-bold border border-[#1a4a1a] bg-[#0a1a0a] px-2 py-1 rounded uppercase tracking-widest">
                  Live
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-1">
                  Threats Neutralized
                </div>
                <div className="text-3xl font-bold text-[#dde1f0]">
                  {stats?.blocked_queries?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {/* Total Queries Card */}
            <div className="bg-[#0c0c16] p-6 rounded-2xl border border-[#1a1a28] hover:border-[#60a5fa]/40 transition-colors">
              <div className="flex justify-between items-start mb-5">
                <div className="p-2.5 bg-[#0a0a1a] border border-[#1a1a3a] text-[#60a5fa] rounded-xl">
                  <Globe size={20} />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-1">
                  Total DNS Queries
                </div>
                <div className="text-3xl font-bold text-[#dde1f0]">
                  {stats?.total_queries?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {/* Block Ratio Card */}
            <div className="bg-[#0c0c16] p-6 rounded-2xl border border-[#1a1a28] hover:border-[#a78bde]/40 transition-colors">
              <div className="flex justify-between items-start mb-5">
                <div className="p-2.5 bg-[#0a0a14] border border-[#2a1a3a] text-[#a78bde] rounded-xl">
                  <Activity size={20} />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-1">
                  Mitigation Ratio
                </div>
                <div className="text-3xl font-bold text-[#dde1f0]">
                  {stats?.block_ratio ? stats.block_ratio.toFixed(1) : "0"}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-[#0c0c16] rounded-2xl border border-[#1a1a28] p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-[#60a5fa]" />
                  Traffic Telemetry
                </h3>
                <p className="text-[10px] text-[#555] mt-1 uppercase tracking-widest">
                  Allowed requests vs mitigated threats over time
                </p>
              </div>

              <div className="h-[280px] w-full flex-1">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={16}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1a1a28"
                      />
                      <XAxis
                        dataKey="time"
                        stroke="#555"
                        tick={{ fontSize: 10, fill: '#555', fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#555"
                        tick={{ fontSize: 10, fill: '#555', fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{ fill: "#0e0e1a" }}
                        contentStyle={{
                          backgroundColor: "#0a0a14",
                          border: "1px solid #1a1a28",
                          borderRadius: "12px",
                          color: "#dde1f0",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                        itemStyle={{ color: "#dde1f0" }}
                      />
                      <Bar
                        dataKey="total"
                        name="Total Queries"
                        stackId="a"
                        fill="#1a1a28"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="blocked"
                        name="Threats Mitigated"
                        stackId="a"
                        fill="#f87171"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#555] text-[10px] uppercase tracking-widest border border-dashed border-[#1a1a28] rounded-xl">
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin text-[#7b8cde] mb-2" size={16} />
                        Syncing Telemetry...
                      </>
                    ) : (
                      "Insufficient Data Matrix"
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Logs Section */}
            <div className="bg-[#0c0c16] rounded-2xl border border-[#1a1a28] p-6 flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest flex items-center gap-2">
                    <Server size={14} className="text-[#f87171]" />
                    Incident Logs
                  </h3>
                  <p className="text-[10px] text-[#555] mt-1 uppercase tracking-widest">
                    Recently blocked domains
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1 scrollbar-thin scrollbar-thumb-[#1a1a28] scrollbar-track-transparent">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a14] border border-[#1a1a28] hover:border-[#f87171]/30 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-[#1a0a0a] border border-[#3a1a1a] flex-shrink-0 text-[#f87171]">
                        <Shield size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-[#dde1f0] truncate">
                          {log.domain}
                        </div>
                        <div className="text-[9px] text-[#555] flex justify-between uppercase tracking-widest mt-1">
                          <span>{log.source || "SRC_UNKNOWN"}</span>
                          <span className="text-[#7b8cde]">{log.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#555] text-[10px] uppercase tracking-widest border border-dashed border-[#1a1a28] rounded-xl py-10">
                    {loading ? (
                      <RefreshCw className="animate-spin text-[#7b8cde] mb-2" size={16} />
                    ) : (
                      <ShieldCheck size={20} className="text-[#4ade80] mb-2 opacity-50" />
                    )}
                    {loading ? "Parsing Logs..." : "Zero Threats Detected"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}