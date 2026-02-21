"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Server,
  ChevronRight,
  Loader2,
  QrCode,
  X,
  Terminal,
  HardDrive,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { usePortal } from "@/providers/PortalProvider";
import { useAuth } from "@clerk/nextjs";
import { useAllDevicesLiveStats, DeviceLiveStats } from "@/api.device";
import { apiService } from "@/api/api";
import { Device } from "@/types/api.device";



const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function DashboardPage() {
  const { devices, addDeviceToState, isLoading } = usePortal();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#080810] text-[#dde1f0] font-mono selection:bg-[#7b8cde]/30 selection:text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      <main className="pt-24 px-6 pb-12 max-w-[1280px] mx-auto min-h-screen">
        <DashboardView
          devices={devices as Device[]}
          isGlobalLoading={isLoading}
          onAddDevice={() => setIsAddModalOpen(true)}
        />
      </main>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddDeviceModal
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={(newDevice) => {
              addDeviceToState(newDevice);
              setIsAddModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardView({
  devices,
  isGlobalLoading,
  onAddDevice,
}: {
  devices: Device[];
  isGlobalLoading: boolean;
  onAddDevice: () => void;
}) {
  const { stats, loading: loadingStats } = useAllDevicesLiveStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-[#151520] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-[#0a0a14] border border-[#1a1a28] rounded-md text-[#555]">
              <Terminal size={16} />
            </div>
            <h1 className="text-lg font-bold tracking-widest text-[#7b8cde] uppercase">
              STRCT DEVICES
            </h1>
          </div>
          <p className="text-[11px] text-[#555] uppercase tracking-widest mt-1">
            Overview of your connected personal servers.
          </p>
        </div>
        <button
          onClick={onAddDevice}
          className="flex items-center gap-2 bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] px-5 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(123,140,222,0.15)] hover:shadow-[0_0_25px_rgba(123,140,222,0.3)]"
        >
          <Plus size={14} /> Provision Node
        </button>
      </div>

      {/* Content Grid */}
      {devices && (isGlobalLoading || devices.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-32 border border-[#151522] border-dashed rounded-2xl bg-[#0a0a12]">
          {isGlobalLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#7b8cde]" size={24} />
              <span className="text-xs text-[#555] uppercase tracking-widest">
                Scanning Network...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <Server size={32} className="text-[#333]" />
              <p className="text-xs text-[#555] uppercase tracking-widest max-w-xs leading-relaxed">
                No active nodes detected. Provision a new device to establish connection.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const deviceStat = stats[device.id];
            return (
              <DeviceCard
                key={device.id}
                device={device}
                liveStats={deviceStat}
                isChecking={loadingStats}
              />
            );
          })}

          {/* Add New Card */}
          <button
            onClick={onAddDevice}
            className="group border border-dashed border-[#2a2a3a] hover:border-[#7b8cde]/50 bg-[#0a0a14] hover:bg-[#0c0c1a] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[260px] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#7b8cde]/0 to-[#7b8cde]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl border border-[#1a1a28] group-hover:border-[#7b8cde]/30 bg-[#0e0e1a] flex items-center justify-center mb-4 text-[#444] group-hover:text-[#7b8cde] group-hover:scale-110 transition-all shadow-none group-hover:shadow-[0_0_20px_rgba(123,140,222,0.1)]">
              <Plus size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
              Pair New Device
            </h3>
            <p className="text-[10px] text-[#555] mt-2 px-4 max-w-[200px] uppercase tracking-widest leading-relaxed">
              Found a serial number? Click to initialize connection.
            </p>
          </button>
        </div>
      )}
    </motion.div>
  );
}

function DeviceCard({
  device,
  liveStats,
  isChecking,
}: {
  device: Device;
  liveStats?: DeviceLiveStats;
  isChecking: boolean;
}) {
  const router = useRouter();

  const isOnline = liveStats?.isOnline ?? false;
  const usedBytes = liveStats?.storageUsed || 0;
  const totalBytes = liveStats?.storageTotal || 1;
  const percentage = Math.min(Math.round((usedBytes / totalBytes) * 100), 100);
  const freeBytes = totalBytes - usedBytes;

  const handleDeviceClick = () => {
    router.push(`/portal/${device.id}`);
  };

  return (
    <div
      onClick={handleDeviceClick}
      className={`group relative bg-[#0c0c16] rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${
        isChecking && !liveStats
          ? "border-[#151522] hover:border-[#252535]"
          : isOnline
          ? "border-[#151522] hover:border-[#7b8cde]/40 hover:shadow-[0_0_30px_rgba(123,140,222,0.05)]"
          : "border-[#1a0a0a] hover:border-[#f87171]/30 opacity-80"
      }`}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a14] border border-[#1a1a28] flex items-center justify-center group-hover:scale-105 transition-transform">
          <Server size={18} className={isOnline ? "text-[#7b8cde]" : "text-[#444]"} />
        </div>

        {/* Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] uppercase tracking-widest font-bold ${
            isChecking && !liveStats
              ? "bg-[#1a1a2a] border-[#2a2a3a] text-[#888]"
              : isOnline
              ? "bg-[#0a1a0a] border-[#1a4a1a] text-[#4ade80]"
              : "bg-[#1a0a0a] border-[#4a1a1a] text-[#f87171]"
          }`}
        >
          {isChecking && !liveStats ? (
            <Loader2 size={10} className="animate-spin text-[#888]" />
          ) : (
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171]"
              }`}
            />
          )}
          {isChecking && !liveStats
            ? "Connecting"
            : isOnline
            ? "Online"
            : "Offline"}
        </div>
      </div>

      {/* Device Info */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-[#dde1f0] mb-1 truncate">
          {device.friendly_name || device.id}
        </h3>
        <div className="text-[10px] text-[#555] uppercase tracking-widest flex items-center gap-1.5 mb-6">
          <Activity size={10} />
          {isOnline ? (
            <span className="text-[#7b8cde]">{liveStats?.ipAddress || "Relay Connected"}</span>
          ) : (
            <span>Unreachable</span>
          )}
        </div>
      </div>

      {/* Storage Stats */}
      <div className="space-y-3 bg-[#0a0a14] border border-[#1a1a28] p-4 rounded-xl">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
          <span className="text-[#555] flex items-center gap-1.5"><HardDrive size={10} /> Storage</span>
          <span className="text-[#dde1f0]">
            {isOnline
              ? `${formatBytes(usedBytes)} / ${formatBytes(totalBytes)}`
              : "-- / --"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-[#1a1a28] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              percentage > 90 ? "bg-[#f87171]" : "bg-[#7b8cde]"
            }`}
            style={{ width: isOnline ? `${percentage}%` : "0%" }}
          />
        </div>

        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
          <span className={percentage > 90 && isOnline ? "text-[#f87171]" : "text-[#444]"}>
            {isOnline && percentage > 90 ? "Critical Capacity" : "Optimal"}
          </span>
          <span className="text-[#555]">
            {isOnline ? `${formatBytes(freeBytes)} Free` : "Unknown"}
          </span>
        </div>
      </div>

      {/* Action Footer (Visible on Hover) */}
      <div className="absolute bottom-6 right-6 flex items-center text-[10px] font-bold text-[#7b8cde] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        Access Node <ChevronRight size={12} className="ml-1" />
      </div>
    </div>
  );
}

function AddDeviceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (d: Device) => void;
}) {
  const { getToken } = useAuth();
  const [step, setStep] = useState<"input" | "connecting" | "error">("input");
  const [serialId, setSerialId] = useState("");
  const [pin, setPin] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClaim = async () => {
    if (!serialId || !pin) return;

    setStep("connecting");
    setErrorMsg("");

    try {
      const token = await getToken();
      if (!token) return;

      const newDevice = await apiService.claimDevice(
        {
          serial_number: serialId,
          claim_token: pin,
          friendly_name: deviceName,
        },
        token
      );

      onSuccess(newDevice as Device);
    } catch (err) {
      const error = err as Error;
      setStep("error");
      setErrorMsg(error.message || "Failed to establish pairing sequence.");
    }
  };

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

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[#0c0c16] border border-[#151522] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0a0a14] border-b border-[#1a1a28] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#7b8cde] text-xs font-bold uppercase tracking-widest">
            <QrCode size={14} /> Claim New Node
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-[#dde1f0] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === "input" && (
            <div className="flex flex-col">
              <p className="text-[11px] text-[#555] uppercase tracking-widest leading-relaxed mb-6">
                Enter the Serial Number (S/N) and PIN code found on the sticker at
                the bottom of your device.
              </p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-1.5">
                    Serial Number
                  </label>
                  <input
                    value={serialId}
                    onChange={(e) => setSerialId(e.target.value)}
                    placeholder="BEE-8829-AB"
                    className="w-full bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-3 py-2.5 text-sm font-mono text-[#dde1f0] focus:outline-none transition-colors placeholder-[#2a2a3a]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-1.5">
                    Security PIN
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-3 py-2.5 text-sm font-mono text-[#dde1f0] focus:outline-none transition-colors placeholder-[#2a2a3a] tracking-widest"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-1.5">
                    Node Designation (Optional)
                  </label>
                  <input
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="STRCT-01"
                    className="w-full bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-3 py-2.5 text-sm font-mono text-[#dde1f0] focus:outline-none transition-colors placeholder-[#2a2a3a]"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleClaim}
                  disabled={!serialId || !pin}
                  className={`w-full flex justify-center py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest ${
                    !serialId || !pin
                      ? "bg-[#11111a] text-[#444] border border-[#1a1a28] cursor-not-allowed"
                      : "bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] shadow-[0_0_15px_rgba(123,140,222,0.15)]"
                  }`}
                >
                  Initialize Pairing
                </button>
              </div>
            </div>
          )}

          {step === "connecting" && (
            <div className="py-12 flex flex-col items-center">
              <Loader2 size={32} className="text-[#7b8cde] animate-spin mb-6" />
              <h3 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest mb-2">
                Handshake Initiated
              </h3>
              <p className="text-[10px] text-[#555] uppercase tracking-widest text-center">
                Exchanging cryptographic keys and verifying identity...
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="py-8 flex flex-col items-center">
              <div className="w-12 h-12 bg-[#1a0a0a] border border-[#f87171]/30 text-[#f87171] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(248,113,113,0.1)]">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest mb-2">
                Pairing Failed
              </h3>
              <p className="text-[11px] text-[#f87171] mb-8 text-center px-4 leading-relaxed font-mono">
                &gt; Error: {errorMsg}
              </p>

              <button
                onClick={() => setStep("input")}
                className="w-full py-3 border border-[#1a1a28] bg-[#0a0a14] hover:bg-[#11111a] hover:border-[#2a2a3a] text-[#888] hover:text-[#dde1f0] rounded-xl text-xs uppercase tracking-widest font-bold transition-all"
              >
                Retry Sequence
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}