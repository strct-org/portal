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
import { useDeviceAdBlockerStats } from "@/api.device";

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
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Safe defaults if stats haven't loaded yet
  const isEnabled = stats?.is_enabled ?? false;
  const chartData = stats?.chart_data || [];
  const logs = stats?.recent_logs || [];

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
                Ad Blocker
                {loading && !stats ? (
                  <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wide">
                    Connecting...
                  </span>
                ) : isEnabled ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1">
                    <ShieldCheck size={12} /> Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1">
                    <ShieldAlert size={12} /> Paused
                  </span>
                )}
              </h1>
              <p className="text-gray-500 mt-1">
                Network-wide protection for {device.friendly_name}
              </p>
            </div>

            {/* Main Toggle */}
            <button
              onClick={toggleBlocker}
              disabled={loading || isToggling}
              className={`relative px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 flex items-center gap-2 ${
                isEnabled
                  ? "bg-[#1d1d1f] hover:bg-black"
                  : "bg-gray-400 hover:bg-gray-500"
              } ${isToggling ? "opacity-80 cursor-wait" : ""}`}
            >
              {isToggling ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Filter size={18} />
              )}
              {isEnabled ? "Disable Blocking" : "Enable Blocking"}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Blocked Ads Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Ban size={24} />
                </div>
                {/* Optional: You could calculate % change if backend provided yesterday's data */}
                <div className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                  Live
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-gray-500 text-sm font-medium">
                  Ads Blocked
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1">
                  {stats?.blocked_queries?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {/* Total Queries Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Globe size={24} />
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">
                  Total Queries
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1">
                  {stats?.total_queries?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {/* Block Ratio Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm font-medium">
                  Block Ratio
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] mt-1">
                  {stats?.block_ratio ? stats.block_ratio.toFixed(1) : "0"}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Traffic Overview
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Allowed requests vs Blocked ads over time
              </p>

              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={20}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f9fafb" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        name="Total Queries"
                        stackId="a"
                        fill="#e5e7eb"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="blocked"
                        name="Ads Blocked"
                        stackId="a"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {loading
                      ? "Loading chart data..."
                      : "No traffic data available yet"}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Logs Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">
                Recent Blocks
              </h3>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500">
                        <Shield size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {log.domain}
                        </div>
                        <div className="text-xs text-gray-400 flex justify-between">
                          <span>{log.source || "Unknown"}</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-10 text-sm">
                    {loading
                      ? "Loading logs..."
                      : "No threats blocked recently"}
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
