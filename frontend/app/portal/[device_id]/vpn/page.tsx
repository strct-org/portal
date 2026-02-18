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
  Home,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";
import { useDeviceVPNStats } from "@/api/device";
import { useState } from "react";

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
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </button>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 1. Control Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full transition-opacity duration-700 ${
                  isExitNode ? "opacity-100" : "opacity-0"
                }`}
              />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isExitNode
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Lock size={24} />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1d1d1f]">
                    Secure Gateway
                  </h1>
                </div>
                <p className="text-gray-500 leading-relaxed max-w-md">
                  {isExitNode
                    ? "Your home network is currently accessible securely. Traffic appears to originate from this device."
                    : "Enable the VPN to route your phone or laptop traffic through this device securely."}
                </p>
              </div>

              {/* Status & Action */}
              <div className="mt-12">
                {hasError ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">
                      Error: {vpnState?.error_message}
                    </span>
                  </div>
                ) : isProvisioning ? (
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">
                      Provisioning secure connection...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isExitNode
                            ? "bg-green-500 animate-pulse"
                            : "bg-orange-400"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-gray-700">
                          {isExitNode ? "VPN Active" : "VPN Standby"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {vpnState?.tailscale_ip
                            ? `IP: ${vpnState.tailscale_ip}`
                            : "Waiting for IP..."}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleToggle}
                      disabled={processing}
                      className={`px-6 py-2 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
                        isExitNode
                          ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                          : "bg-[#1d1d1f] hover:bg-black"
                      }`}
                    >
                      {processing ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Power size={16} />
                      )}
                      {isExitNode ? "Stop" : "Start"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Visual Indicator */}
            <div className="bg-[#1d1d1f] rounded-[2rem] p-8 shadow-xl text-white flex flex-col items-center justify-center relative overflow-hidden text-center">
              {isExitNode && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-64 h-64 border border-white rounded-full animate-ping absolute" />
                  <div className="w-48 h-48 border border-white rounded-full animate-ping delay-75 absolute" />
                </div>
              )}

              <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-full mb-6 border border-white/20">
                {isExitNode ? (
                  <ShieldCheck size={40} className="text-green-400" />
                ) : (
                  <Home size={40} className="text-gray-400" />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {isExitNode ? "Tunnel Active" : "Tunnel Inactive"}
              </h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {isExitNode
                  ? "Devices connected to your company network can now route via this node."
                  : "Start the VPN to secure your connection."}
              </p>

              <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-xs font-mono text-blue-200">
                <MapPin size={12} />
                {device.local_ip}
              </div>
            </div>
          </div>

          {/* Client Connection Instructions */}
          <div
            className={`transition-all duration-500 ${
              isExitNode
                ? "opacity-100 translate-y-0"
                : "opacity-50 blur-sm pointer-events-none"
            }`}
          >
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-6 px-2">
              Connect Your Device
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Smartphone size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-[#1d1d1f]">Mobile App</div>
                    <div className="text-xs text-gray-400">Install Client</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowQr(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <QrCode size={16} /> QR Code
                </button>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Laptop size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-[#1d1d1f]">Desktop</div>
                    <div className="text-xs text-gray-400">Install Client</div>
                  </div>
                </div>
                <a
                  href="https://tailscale.com/download"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showQr && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowQr(false)}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center"
                >
                  <h3 className="text-xl font-bold mb-2">Get the App</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Download the app to connect to the company network.
                  </p>
                  <div className="w-64 h-64 bg-white border border-gray-100 rounded-xl flex items-center justify-center mb-6">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tailscale.com/download`}
                      alt="Download"
                      className="w-56 h-56"
                    />
                  </div>
                  <button
                    onClick={() => setShowQr(false)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
