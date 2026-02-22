"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HardDrive,
  Shield,
  Globe,
  Activity,
  ChevronRight,
  Server,
  Wifi,
  X,
  Settings,
  Terminal,
  RefreshCw,
  Trash2,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  onClick: () => void;
  status?: "active" | "inactive" | "beta";
}

export default function DeviceHub() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading } = usePortal();

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const deviceId = params.device_id as string;
  const device = devices?.find((d) => d?.id === deviceId);

  // Updated to use specific hex colors for the glowing borders and text
  const features = [
    {
      id: "storage",
      title: "File Storage",
      description: "Access, upload, and manage your personal files securely.",
      icon: HardDrive,
      accent: "#fbbf24", // amber-400
      path: `/portal/${deviceId}/storage`,
      status: "active" as const,
    },
    {
      id: "vpn",
      title: "VPN Tunnel",
      description: "Secure your internet connection with a personal VPN tunnel.",
      icon: Globe,
      accent: "#7b8cde", // primary accent
      path: `/portal/${deviceId}/vpn`,
      status: "active" as const,
    },
    {
      id: "adblock",
      title: "Ad Blocker",
      description: "Network-wide ad blocking for all your home devices.",
      icon: Shield,
      accent: "#f87171", // red-400
      path: `/portal/${deviceId}/adblock`,
      status: "active" as const,
    },
    {
      id: "monitor",
      title: "Network Monitor",
      description: "Real-time speed, latency, and download time stats.",
      icon: Activity,
      accent: "#4ade80", // green-400
      path: `/portal/${deviceId}/network`,
      status: "active" as const,
    },
    {
      id: "wifi",
      title: "Wi-Fi Hotspot",
      description: "Configure hotspot settings and network credentials.",
      icon: Wifi,
      accent: "#a78bde", // purple-400
      path: `/portal/${deviceId}/wifi`,
      status: "active" as const,
    },
    {
      id: "web",
      title: "Web Hosting",
      description: "Host simple static websites directly from your device.",
      icon: Globe,
      accent: "#f472b6", // pink-400
      path: `/portal/${deviceId}/hosting`,
      status: "active" as const,
    },
    {
      id: "router",
      title: "Advanced Router",
      description: "Customize your internet experience with advanced routing options.",
      icon: Server,
      accent: "#60a5fa", // blue-400
      path: `/portal/${deviceId}/router`,
      status: "active" as const,
    },
  ];

  if (isLoading || !device) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center font-mono">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-[#7b8cde]" size={24} />
            <span className="text-[10px] text-[#555] uppercase tracking-widest">
              Connecting to Node...
            </span>
          </div>
        ) : (
          <div className="text-center p-8 border border-[#1a1a28] rounded-2xl bg-[#0c0c16]">
            <Server className="mx-auto text-[#444] mb-4" size={32} />
            <h1 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest mb-2">
              Node Not Found
            </h1>
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-6">
              The requested device is offline or unavailable.
            </p>
            <button
              onClick={() => router.push("/portal/dashboard")}
              className="text-[#7b8cde] hover:text-[#8d9de8] text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Return to Devices
            </button>
          </div>
        )}
      </div>
    );
  }

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
              onClick={() => router.push("/portal/dashboard")}
              className="text-[#444] hover:text-[#dde1f0] transition-colors flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold"
            >
              <ArrowLeft size={14} /> Devices
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#7b8cde]" />
              <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-[#7b8cde]">
                  {device.friendly_name}
                </h1>
                <p className="text-[9px] text-[#555] mt-0.5 uppercase tracking-widest">
                  {deviceId}
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
              <h2 className="text-xl font-bold text-[#dde1f0] mb-2 flex items-center gap-3">
                Active Modules
              </h2>
              {/* <p className="text-[11px] text-[#555] uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#7b8cde]">{device.local_ip || "192.168.1.x"}</span> 
                <span className="text-[#333]">/</span> 
                Manage subsystems and applications
              </p> */}
            </div>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#7b8cde]/40 text-[#dde1f0] rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-sm"
            >
              <Settings size={14} className="text-[#7b8cde]" />
              Configuration
            </button>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                accent={feature.accent}
                onClick={() => router.push(feature.path)}
                status={feature.status}
              />
            ))}
          </div>
        </motion.div>

        {/* Settings Modal */}
        <AnimatePresence>
          {settingsModalOpen && device && (
            <SettingsModal
              onClose={() => setSettingsModalOpen(false)}
              deviceName={device.friendly_name}
              deviceId={device.id}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  onClick: () => void;
  status?: "active" | "beta" | "inactive";
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  accent,
  onClick,
  status = "active",
}: FeatureCardProps) {
  const isInactive = status === "inactive";

  return (
    <motion.div
      onClick={!isInactive ? onClick : undefined}
      whileHover={!isInactive ? { y: -2 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative rounded-2xl border transition-colors duration-300 overflow-hidden flex flex-col min-h-[180px] ${
        isInactive
          ? "bg-[#0a0a12] border-[#111118] opacity-40 cursor-not-allowed"
          : "bg-[#0a0a12] border-[#131320] hover:border-[#1e1e30] cursor-pointer"
      }`}
    >
      {/* Light sweep on hover — replaces the expanding glow box */}
      {!isInactive && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${accent}09 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Accent line along top edge */}
      <div
        className="absolute top-0 left-6 right-6 h-px transition-all duration-500"
        style={{
          background: isInactive
            ? "transparent"
            : `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
          opacity: 0,
        }}
        ref={(el) => {
          // CSS-only approach via group-hover instead of JS ref
        }}
      />
      {/* Use CSS group-hover for the line */}
      <style>{`
        .group:hover .accent-line { opacity: 1 !important; }
      `}</style>
      <div
        className="accent-line absolute top-0 left-6 right-6 h-px transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}50, transparent)`,
          opacity: 0,
        }}
      />

      {/* Card content */}
      <div className="relative z-10 p-6 flex flex-col flex-1">

        {/* Top row: icon (free-floating) + badge */}
        <div className="flex items-start justify-between mb-6">
          {/* Icon — no box, just the icon itself with a drop shadow */}
          <div
            className={`transition-all duration-400 ${
              !isInactive ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : ""
            }`}
            style={{
              filter: isInactive
                ? "none"
                : `drop-shadow(0 0 8px ${accent}55)`,
            }}
          >
            <Icon
              size={22}
              style={{ color: isInactive ? "#2a2a3a" : accent }}
            />
          </div>

          {/* Badges */}
          {status === "beta" && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded"
              style={{
                color: accent,
                background: `${accent}12`,
                border: `1px solid ${accent}25`,
              }}
            >
              Beta
            </span>
          )}
          {status === "inactive" && (
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded text-[#333] bg-[#111] border border-[#1a1a28]">
              Unassigned
            </span>
          )}
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="text-[11px] font-bold text-[#c8cfe8] uppercase tracking-[0.15em] mb-2">
            {title}
          </h3>
          <p className="text-[10px] text-[#33334a] leading-relaxed font-mono">
            {description}
          </p>
        </div>

        {/* Bottom action — slides up on hover */}
        {!isInactive && (
          <div className="mt-5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] opacity-0 translate-y-1.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
               style={{ color: accent }}>
            Initialize
            <ChevronRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Bottom edge accent — thin rule that appears on hover */}
      {!isInactive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${accent}20 50%, transparent 90%)`,
          }}
        />
      )}
    </motion.div>
  );
}

function SettingsModal({
  onClose,
  deviceName,
  deviceId,
}: {
  onClose: () => void;
  deviceName: string;
  deviceId: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#080810]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-[#0c0c16] border border-[#151522] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="bg-[#0a0a14] border-b border-[#1a1a28] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-[#7b8cde]" />
            <h3 className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest">
              Node Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-[#dde1f0] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl border border-[#1a1a28] bg-[#0a0a14]">
            <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">
              Hardware Signature
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[#7b8cde] bg-[#0e0e1a] px-2 py-1 rounded border border-[#1a1a28]">
                {deviceId}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#1a1a28] bg-[#0a0a14]">
            <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-3">
              Access Control
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#dde1f0] text-sm">
                  Global File Sharing
                </div>
                <div className="text-[10px] text-[#555] mt-0.5">
                  Allow authorized clients to mount volumes
                </div>
              </div>
              <div className="px-2.5 py-1 rounded border border-[#1a4a1a] bg-[#0a1a0a] text-[#4ade80] text-[9px] uppercase tracking-widest font-bold">
                Permitted
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#1a1a28] bg-[#0a0a14]">
            <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-3">
              Administrative Actions
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1a1a28] bg-[#0e0e1a] hover:border-[#7b8cde]/50 text-xs font-bold text-[#dde1f0] transition-colors uppercase tracking-widest">
                <Edit2 size={12} className="text-[#7b8cde]" /> Rename
              </button>
              <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-[#3a1a1a] bg-[#1a0a0a] hover:border-[#f87171]/50 text-xs font-bold text-[#f87171] transition-colors uppercase tracking-widest">
                <Trash2 size={12} /> Decommission
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1a1a28] bg-[#0a0a14] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-bold text-[#888] hover:text-[#dde1f0] text-xs uppercase tracking-widest transition-colors"
          >
            Abort
          </button>
          <button className="px-5 py-2.5 rounded-lg font-bold bg-[#7b8cde] text-[#080810] hover:bg-[#8d9de8] text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(123,140,222,0.15)]">
            Write Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}