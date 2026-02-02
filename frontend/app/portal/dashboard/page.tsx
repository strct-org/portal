"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  HardDrive,
  ChevronRight,
  Loader2,
  QrCode,
  X,
  Server,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { apiService } from "@/api";
import { usePortal } from "@/providers/PortalProvider";
import { useAuth } from "@clerk/nextjs";
import { useAllDevicesLiveStats, DeviceLiveStats } from "@/api.device"; // Import the new hook

// Helper to format the bytes coming from Go server
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
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f] selection:bg-[#ffc233] selection:text-black">
      <main className="pt-30 px-4 pb-12 max-w-[1280px] mx-auto min-h-screen">
        <DashboardView
          devices={devices}
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
  devices: any[];
  isGlobalLoading: boolean;
  onAddDevice: () => void;
}) {
  // 1. Fetch live stats for ALL devices here
  const { stats, loading: loadingStats } = useAllDevicesLiveStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-2">
            My Cloud
          </h1>
          <p className="text-gray-500 font-medium">
            Overview of your connected personal servers.
          </p>
        </div>
        <button
          onClick={onAddDevice}
          className="flex items-center gap-2 bg-[#1d1d1f] text-white px-5 py-2.5 rounded-full font-semibold shadow-lg hover:bg-black hover:scale-105 transition-all"
        >
          <Plus size={18} /> Add New Bee
        </button>
      </div>

      {devices && (isGlobalLoading || devices.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20">
          {isGlobalLoading ? (
            <Loader2 className="animate-spin text-gray-400" size={32} />
          ) : (
            <div className="text-gray-400">
              No devices found. Add one to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {devices.map((device) => {
            // 2. Extract specific stats for this device
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
          <div
            onClick={onAddDevice}
            className="border-2 border-dashed border-gray-300 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-[#ffc233] hover:bg-[#fffcf0] transition-all cursor-pointer min-h-[300px] group"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400 group-hover:text-[#ffc233] group-hover:scale-110 transition-all">
              <Plus size={28} />
            </div>
            <h3 className="font-bold text-gray-900">Pair New Device</h3>
            <p className="text-sm text-gray-400 mt-2 px-4 max-w-[200px]">
              Found a serial number? Click to claim.
            </p>
          </div>
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
  device: any;
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
      className={`group relative bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50 hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer overflow-hidden ${
        !isOnline && !isChecking ? "grayscale opacity-80" : ""
      }`}
    >
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {isChecking && !liveStats ? (
          <Loader2 size={12} className="animate-spin text-gray-400" />
        ) : (
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-400"
            }`}
          ></span>
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {isChecking && !liveStats
            ? "Connecting..."
            : isOnline
            ? "Online"
            : "Offline"}
        </span>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <Server size={32} className="text-[#1d1d1f]" />
      </div>

      <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
        {device.friendly_name || device.id}
      </h3>
      <p className="text-sm text-gray-500 mb-8 font-mono h-5 flex items-center">
        {isOnline ? (
          liveStats?.ipAddress || "Connected via Relay"
        ) : (
          <span className="flex items-center gap-1">Unreachable</span>
        )}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-600">Storage Used</span>
          <span className="text-[#1d1d1f]">
            {isOnline
              ? `${formatBytes(usedBytes)} / ${formatBytes(totalBytes)}`
              : "-- / --"}
          </span>
        </div>

        {/* Progress Bar Background */}
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          {/* Actual Progress Bar */}
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              percentage > 90 ? "bg-red-500" : "bg-[#ffc233]"
            }`}
            style={{ width: isOnline ? `${percentage}%` : "0%" }}
          />
        </div>

        <div className="text-right text-[10px] text-gray-400 font-medium">
          {isOnline ? `${formatBytes(freeBytes)} Free` : "Unknown"}
        </div>
      </div>

      {/* Action Link (Visible on Hover) */}
      <div className="mt-8 flex items-center text-sm font-bold text-[#ffc233] opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
        Manage Device <ChevronRight size={16} />
      </div>
    </div>
  );
}

function AddDeviceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (d: any) => void;
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

      console.log(newDevice);
      onSuccess(newDevice);
    } catch (err: any) {
      setStep("error");
      setErrorMsg(err.message || "Failed to pair device");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        {step === "input" && (
          <div className="py-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#ffc233]/20 rounded-full flex items-center justify-center mb-6">
              <QrCode size={28} className="text-[#ffc233]" />
            </div>

            <h3 className="text-xl font-bold mb-2">Claim Device</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Enter the Serial Number (S/N) and PIN code found on the sticker at
              the bottom of your BeeStation.
            </p>

            <div className="w-full space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Serial Number
                </label>
                <input
                  value={serialId}
                  onChange={(e) => setSerialId(e.target.value)}
                  placeholder="BEE-8829-AB"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc233] focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  PIN Code
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Secret Pass"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc233] focus:outline-none font-mono tracking-widest"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Name Your Device
                </label>
                <input
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="My Device"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc233] focus:outline-none font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={!serialId || !pin}
              className={`w-full mt-8 py-4 rounded-xl font-bold transition-all ${
                !serialId || !pin
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#1d1d1f] text-white hover:bg-black shadow-lg"
              }`}
            >
              Claim
            </button>
          </div>
        )}

        {step === "connecting" && (
          <div className="py-8 flex flex-col items-center">
            <Loader2 size={40} className="text-[#1d1d1f] animate-spin mb-6" />
            <h3 className="text-xl font-bold mb-2">Verifying...</h3>
            <p className="text-gray-500">Checking device availability</p>
          </div>
        )}

        {step === "error" && (
          <div className="py-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <X size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Pairing Failed</h3>
            <p className="text-gray-500 mb-6 px-4">{errorMsg}</p>

            <button
              onClick={() => setStep("input")}
              className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
