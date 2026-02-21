"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  MapPin,
  QrCode,
  Download,
  Smartphone,
  Laptop,
  Power,
  Globe,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Terminal,
  X,
  ChevronRight,
  Server,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";
import { useDeviceVPNStats } from "@/api/device";
import { useState } from "react";
import Image from "next/image";

export default function LocalVPN() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.device_id as string;

  const { devices } = usePortal();
  const device = devices?.find((d) => d?.id === deviceId);

  const { vpnState, loading, processing, toggleExitNode } =
    useDeviceVPNStats(deviceId);

  const [showQr, setShowQr] = useState(false);

  // Derived State
  const isRunning = vpnState?.is_running ?? false;
  const isExitNode = vpnState?.is_exit_node ?? false;
  const isProvisioning = !isRunning && !vpnState?.error_message;
  const hasError = !!vpnState?.error_message;

  const handleToggle = () => {
    toggleExitNode(!isExitNode);
  };

  if (loading || !device) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#7b8cde]" size={24} />
          <span className="text-[10px] text-[#555] uppercase tracking-widest">
            Establishing Secure Tunnel...
          </span>
        </div>
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
              onClick={() => router.push(`/portal/${deviceId}`)}
              className="text-[#444] hover:text-[#dde1f0] transition-colors flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold"
            >
              <ArrowLeft size={14} /> Hub
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#7b8cde]" />
              <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-[#7b8cde]">
                  {device.friendly_name}
                </h1>
                <p className="text-[9px] text-[#555] mt-0.5 uppercase tracking-widest">
                  VPN Subsystem
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
                Secure Gateway
              </h2>
              <p className="text-[11px] text-[#555] uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#7b8cde]">
                  {device.local_ip || "192.168.1.x"}
                </span>
                <span className="text-[#333]">/</span>
                Manage VPN Routing & Access
              </p>
            </div>
          </div>

          {/* Core Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Control Card */}
            <div className="bg-[#0c0c16] rounded-2xl p-6 border border-[#1a1a28] flex flex-col justify-between relative overflow-hidden group">
              {/* Subtle Background Glow */}
              <div
                className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
                  isExitNode
                    ? "bg-[#4ade80]/5 opacity-100"
                    : "bg-[#7b8cde]/5 opacity-0"
                }`}
              />

              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isExitNode
                        ? "bg-[#0a1a0a] border-[#1a4a1a] text-[#4ade80]"
                        : "bg-[#0a0a14] border-[#1a1a28] text-[#555]"
                    }`}
                  >
                    <Lock size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
                    Network Tunnel
                  </h3>
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed mb-6">
                  {isExitNode
                    ? "Subsystem active. Remote traffic is currently being securely routed through this hardware node."
                    : "Initialize the VPN tunnel to securely route your external traffic through this local device."}
                </p>
              </div>

              {/* Status & Action */}
              <div className="mt-auto">
                {hasError ? (
                  <div className="bg-[#1a0a0a] border border-[#3a1a1a] text-[#f87171] p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      ERR: {vpnState?.error_message}
                    </span>
                  </div>
                ) : isProvisioning ? (
                  <div className="bg-[#0a0a1a] border border-[#1a1a3a] text-[#7b8cde] p-4 rounded-xl flex items-center gap-3">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                      Provisioning connection...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#0a0a14] p-4 rounded-xl border border-[#1a1a28] relative z-10 gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isExitNode
                            ? "bg-[#4ade80] animate-pulse shadow-[0_0_8px_#4ade80]"
                            : "bg-[#fbbf24]"
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest">
                          {isExitNode ? "Tunnel Active" : "Tunnel Standby"}
                        </div>
                        <div className="text-[9px] text-[#555] mt-1 font-mono uppercase tracking-widest">
                          {vpnState?.tailscale_ip
                            ? `IP: ${vpnState.tailscale_ip}`
                            : "Awaiting IP Assignment"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleToggle}
                      disabled={processing}
                      className={`px-5 py-2.5 rounded-lg font-bold text-[10px] transition-all flex items-center gap-2 uppercase tracking-widest border ${
                        isExitNode
                          ? "bg-[#1a0a0a] border-[#3a1a1a] hover:border-[#f87171]/50 text-[#f87171]"
                          : "bg-[#0a1a0a] border-[#1a4a1a] hover:border-[#4ade80]/50 text-[#4ade80]"
                      }`}
                    >
                      {processing ? (
                        <RefreshCw className="animate-spin" size={14} />
                      ) : (
                        <Power size={14} />
                      )}
                      {isExitNode ? "Terminate" : "Initialize"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Indicator Map/Node */}
            <div className="bg-[#0c0c16] rounded-2xl p-6 border border-[#1a1a28] flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[280px]">
              {/* Radar Rings */}
              {isExitNode && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-64 h-64 border border-[#4ade80] rounded-full animate-ping absolute opacity-20" />
                  <div className="w-48 h-48 border border-[#4ade80] rounded-full animate-ping delay-75 absolute opacity-40" />
                </div>
              )}

              <div
                className={`relative z-10 p-5 rounded-full mb-5 border ${
                  isExitNode
                    ? "bg-[#0a1a0a] border-[#1a4a1a] shadow-[0_0_30px_rgba(74,222,128,0.15)]"
                    : "bg-[#0a0a14] border-[#1a1a28]"
                }`}
              >
                {isExitNode ? (
                  <ShieldCheck size={32} className="text-[#4ade80]" />
                ) : (
                  <Globe size={32} className="text-[#444]" />
                )}
              </div>

              <h2 className="text-sm font-bold text-[#dde1f0] mb-2 uppercase tracking-widest">
                {isExitNode ? "Node Routing Engaged" : "Node Offline"}
              </h2>
              <p className="text-[10px] text-[#555] max-w-[250px] mx-auto uppercase tracking-widest leading-relaxed">
                {isExitNode
                  ? "Authorized devices can now route encrypted traffic via this node."
                  : "Start the VPN subsystem to secure your external connection."}
              </p>

              <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-[#0a0a14] rounded-md border border-[#1a1a28] text-[9px] font-mono text-[#7b8cde] uppercase tracking-widest">
                <MapPin size={10} />
                LOC: {device.local_ip}
              </div>
            </div>
          </div>

          {/* Client Connection Instructions */}
          <div
            className={`transition-all duration-500 ${
              isExitNode
                ? "opacity-100 translate-y-0"
                : "opacity-40 grayscale pointer-events-none"
            }`}
          >
            <h3 className="text-xs font-bold text-[#dde1f0] mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Server size={14} className="text-[#7b8cde]" />
              Client Interfaces
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mobile Card */}
              <div className="group bg-[#0c0c16] p-6 rounded-2xl border border-[#1a1a28] hover:border-[#60a5fa]/40 hover:bg-[#0e0e1a] transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0a0a14] border border-[#1a1a28] text-[#60a5fa] rounded-xl group-hover:scale-110 transition-transform duration-500">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
                      Mobile Client
                    </div>
                    <div className="text-[10px] text-[#555] mt-1 uppercase tracking-widest">
                      iOS / Android
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowQr(true)}
                  className="px-4 py-2 bg-[#0a0a14] hover:bg-[#1a1a28] border border-[#1a1a28] text-[#dde1f0] rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <QrCode size={12} className="text-[#60a5fa]" /> Scan QR
                </button>
              </div>

              {/* Desktop Card */}
              <div className="group bg-[#0c0c16] p-6 rounded-2xl border border-[#1a1a28] hover:border-[#a78bde]/40 hover:bg-[#0e0e1a] transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0a0a14] border border-[#1a1a28] text-[#a78bde] rounded-xl group-hover:scale-110 transition-transform duration-500">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
                      Desktop Client
                    </div>
                    <div className="text-[10px] text-[#555] mt-1 uppercase tracking-widest">
                      macOS / Windows / Linux
                    </div>
                  </div>
                </div>
                <a
                  href="https://tailscale.com/download"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#0a0a14] hover:bg-[#1a1a28] border border-[#1a1a28] text-[#dde1f0] rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Download size={12} className="text-[#a78bde]" /> Download
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQr && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#080810]/80 backdrop-blur-sm"
                onClick={() => setShowQr(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative bg-[#0c0c16] border border-[#151522] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              >
                <div className="bg-[#0a0a14] border-b border-[#1a1a28] px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <QrCode size={16} className="text-[#60a5fa]" />
                    <h3 className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest">
                      Client Provisioning
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowQr(false)}
                    className="text-[#555] hover:text-[#dde1f0] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                  <div className="p-3 bg-white border-4 border-[#1a1a28] rounded-xl mb-6 shadow-[0_0_20px_rgba(96,165,250,0.1)]">
                    <Image
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tailscale.com/download"
                      width={48}
                      height={48}
                      alt="Tailscale Logo"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-[#dde1f0] mb-2 uppercase tracking-widest">
                    Download Client App
                  </h4>
                  <p className="text-[10px] text-[#555] uppercase tracking-widest leading-relaxed">
                    Scan to install the required application and authenticate to
                    this node.
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-[#1a1a28] bg-[#0a0a14] px-6 py-4 flex justify-center">
                  <button
                    onClick={() => setShowQr(false)}
                    className="w-full px-5 py-2.5 rounded-lg border border-[#1a1a28] bg-[#0e0e1a] hover:border-[#60a5fa]/50 text-[#dde1f0] text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
