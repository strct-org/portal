"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HardDrive,
  Shield,
  Globe,
  Settings,
  Activity,
  ChevronRight,
  Server,
  Wifi,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
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

  const features = [
    {
      id: "storage",
      title: "File Storage",
      description: "Access, upload, and manage your personal files securely.",
      icon: HardDrive,
      color: "bg-[#ffc233]",
      path: `/portal/${deviceId}/storage`,
      status: "active" as const,
    },
    {
      id: "vpn",
      title: "Private VPN",
      description:
        "Secure your internet connection with a personal VPN tunnel.",
      icon: Globe,
      color: "bg-blue-500",
      path: `/portal/${deviceId}/vpn`,
      status: "inactive" as const,
    },
    {
      id: "adblock",
      title: "Ad Blocker",
      description: "Network-wide ad blocking for all your home devices",
      icon: Shield,
      color: "bg-red-500",
      path: `/portal/${deviceId}/adblock`,
      status: "inactive" as const,
      // status: "beta" as const,
    },
    {
      id: "monitor",
      title: "Network Monitor",
      description: "Real-time speed, latency, and download time stats",
      icon: Activity,
      color: "bg-green-500",
      path: `/portal/${deviceId}/network`,
      status: "active" as const,
    },
    {
      id: "wifi",
      title: "Wi-Fi Manager",
      description: "Configure hotspot settings and network credentials.",
      icon: Wifi,
      color: "bg-purple-500",
      path: `/portal/${deviceId}/network`,
      status: "inactive" as const,
    },
    {
      id: "web",
      title: "Web Hosting",
      description: "Host simple static websites directly from your device.",
      icon: Globe,
      color: "bg-pink-500",
      path: `/portal/${deviceId}/web`,
      status: "inactive" as const,
    },
  ];

  if (isLoading || !device) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Device Not Found
            </h1>
            <button
              onClick={() => router.push("/portal/dashboard")}
              className="mt-4 text-blue-600 hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f]">
      <main className="pt-24 px-6 pb-12 max-w-[1200px] mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200">
                <Server className="text-white" size={36} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight">
                  {device.friendly_name} Dashboard
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                  Online • {device.local_ip || "192.168.1.x"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              Settings
            </button>
          </div>
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back to Devices
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color={feature.color}
                onClick={() => router.push(feature.path)}
                status={feature.status}
              />
            ))}
          </div>

          {settingsModalOpen && device && (
            <SettingsModal
              onClose={() => setSettingsModalOpen(false)}
              deviceName={device.friendly_name}
              deviceId={device.id}
            />
          )}
        </motion.div>
      </main>
    </div>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              Device Settings
            </h3>
            <p className="text-sm text-gray-500">
              Manage preferences for {deviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Device ID
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-sm text-gray-800">
                {deviceId}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Visibility
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Allow file sharing
                </div>
                <div className="text-xs text-gray-500">
                  Let invited users access files
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                Enabled
              </div>
            </div>
          </div>

          

          <div className="p-4 rounded-2xl border border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Actions
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                Rename Device
              </button>
              <button className="flex-1 px-4 py-2 rounded-xl border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                Remove Device
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button className="px-6 py-3 rounded-xl font-bold bg-[#1d1d1f] text-white hover:bg-black transition-colors">
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}


function FeatureCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  status = "active",
}: FeatureCardProps) {
  const isInactive = status === "inactive";

  return (
    <div
      onClick={!isInactive ? onClick : undefined}
      className={`group relative bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all duration-300 overflow-hidden ${
        isInactive
          ? "opacity-60 cursor-not-allowed grayscale-[0.5]"
          : "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      }`}
    >
      {status === "beta" && (
        <div className="absolute top-6 right-6 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wide">
          Beta
        </div>
      )}
      {status === "inactive" && (
        <div className="absolute top-6 right-6 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wide">
          Coming Soon
        </div>
      )}

      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform duration-500 group-hover:scale-110 ${
          isInactive ? "bg-gray-200 text-gray-400" : `${color} text-white`
        }`}
      >
        <Icon size={28} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#1d1d1f]">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">
          {description}
        </p>
      </div>

      {!isInactive && (
        <div className="mt-8 flex items-center text-sm font-bold text-gray-900 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          Open App <ChevronRight size={16} className="ml-1" />
        </div>
      )}
    </div>
  );
}
