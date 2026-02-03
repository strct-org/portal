"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  MapPin,
  QrCode,
  Download,
  Smartphone,
  Laptop,
  Check,
  Power,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";

export default function LocalVPN() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading: portalLoading } = usePortal();
  const device = devices?.find((d) => d?.id === params.device_id);

  const [vpnRunning, setVpnRunning] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Toggle Server
  const toggleVpn = () => {
    setVpnRunning(!vpnRunning);
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
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </button>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 1. Status & Control Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
              {/* Decorative Background */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full transition-opacity duration-700 ${
                  vpnRunning ? "opacity-100" : "opacity-0"
                }`}
              />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      vpnRunning
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Lock size={24} />
                  </div>
                  <h1 className="text-3xl font-bold text-[#1d1d1f]">
                    Home VPN
                  </h1>
                </div>
                <p className="text-gray-500 leading-relaxed max-w-md">
                  Securely connect back to your home network from anywhere in
                  the world. Traffic will appear as if it originates from this
                  device.
                </p>
              </div>

              <div className="mt-12 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      vpnRunning ? "bg-green-500 animate-pulse" : "bg-gray-300"
                    }`}
                  />
                  <span className="font-bold text-gray-700">
                    {vpnRunning ? "Server Running" : "Server Stopped"}
                  </span>
                </div>
                <button
                  onClick={toggleVpn}
                  className={`px-6 py-2 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
                    vpnRunning
                      ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                      : "bg-[#1d1d1f] hover:bg-black"
                  }`}
                >
                  <Power size={16} />
                  {vpnRunning ? "Stop" : "Start"}
                </button>
              </div>
            </div>

            {/* 2. Location Lock Visual */}
            <div className="bg-[#1d1d1f] rounded-[2rem] p-8 shadow-xl text-white flex flex-col items-center justify-center relative overflow-hidden text-center">
              {/* Radar Animation */}
              {vpnRunning && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-64 h-64 border border-white rounded-full animate-ping absolute" />
                  <div className="w-48 h-48 border border-white rounded-full animate-ping delay-75 absolute" />
                </div>
              )}

              <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-full mb-6 border border-white/20">
                <Home size={40} className="text-blue-300" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Location Locked</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Your digital presence is anchored to your physical home.
              </p>

              <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-xs font-mono text-blue-200">
                <MapPin size={12} />
                {device.friendly_name} • {device.local_ip}
              </div>
            </div>
          </div>

          {/* Client Configuration Section */}
          <div
            className={`transition-all duration-500 ${
              vpnRunning
                ? "opacity-100 translate-y-0"
                : "opacity-50 blur-sm pointer-events-none"
            }`}
          >
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-6 px-2">
              Connect a Device
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mobile Config */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Smartphone size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-[#1d1d1f]">
                      Mobile Device
                    </div>
                    <div className="text-xs text-gray-400">Scan QR Code</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowQr(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <QrCode size={16} /> Show QR
                </button>
              </div>

              {/* Desktop Config */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Laptop size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-[#1d1d1f]">Computer</div>
                    <div className="text-xs text-gray-400">Download .conf</div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                  <Download size={16} /> Config
                </button>
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
                  <h3 className="text-xl font-bold mb-2">Scan to Connect</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Use the WireGuard app to scan this code.
                  </p>

                  <div className="w-64 h-64 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-6">
                    <QrCode size={128} className="opacity-50" />
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
