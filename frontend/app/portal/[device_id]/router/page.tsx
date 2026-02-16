"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wifi,
  Lock,
  Globe,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Server,
  Zap,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouterSettings } from "@/api.device";

export default function RouterDashboard() {
  const router = useRouter();
  const {
    config,
    loading,
    saving,
    hasChanges,
    updateSetting,
    addPortRule,
    removePortRule,
    saveChanges,
  } = useRouterSettings();

  const [showPassword, setShowPassword] = useState(false);
  const [showAddPort, setShowAddPort] = useState(false);

  // Temporary state for new port rule
  const [newPortName, setNewPortName] = useState("");
  const [newPortNum, setNewPortNum] = useState("");
  const [newPortIP, setNewPortIP] = useState("");

  const handleAddPort = () => {
    if (!newPortName || !newPortNum || !newPortIP) return;
    addPortRule({
      name: newPortName,
      port: parseInt(newPortNum),
      device_ip: newPortIP,
      protocol: "BOTH",
    });
    setNewPortName("");
    setNewPortNum("");
    setNewPortIP("");
    setShowAddPort(false);
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        <p className="text-gray-500 font-medium">Connecting to Router...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f]">
      {/* Sticky Bottom Save Bar (Only visible when changes exist) */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[600px] z-50"
          >
            <div className="bg-[#1d1d1f]/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="text-yellow-400 animate-pulse" size={20} />
                <span className="font-medium">Unsaved changes detected</span>
              </div>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                {saving ? "Applying..." : "Apply Changes"}
                {!saving && <Save size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-28 px-6 pb-24 max-w-[1000px] mx-auto min-h-screen">
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

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1d1d1f]">
              Router Settings
            </h1>
            <p className="text-gray-500 mt-2">
              Advanced network configuration made simple.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Wi-Fi Configuration */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Wifi size={20} />
                </div>
                <h2 className="text-xl font-bold">Wireless Network</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SSID Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Wi-Fi Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={config.ssid}
                    onChange={(e) => updateSetting("ssid", e.target.value)}
                    className="w-full bg-[#f2f2f7] border-none rounded-xl px-4 py-3 font-semibold text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={config.password}
                      onChange={(e) =>
                        updateSetting("password", e.target.value)
                      }
                      className="w-full bg-[#f2f2f7] border-none rounded-xl px-4 py-3 font-semibold text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ToggleCard
                  icon={<Lock size={18} />}
                  label="WPA3 Security"
                  active={config.security_mode === "WPA3"}
                  onClick={() =>
                    updateSetting(
                      "security_mode",
                      config.security_mode === "WPA3" ? "WPA2" : "WPA3"
                    )
                  }
                  color="green"
                />
                <ToggleCard
                  icon={<Zap size={18} />}
                  label="5GHz Boost"
                  active={
                    config.frequency === "DUAL" || config.frequency === "5GHz"
                  }
                  onClick={() =>
                    updateSetting(
                      "frequency",
                      config.frequency === "2.4GHz" ? "DUAL" : "2.4GHz"
                    )
                  }
                  color="purple"
                />
                <ToggleCard
                  icon={<EyeOff size={18} />}
                  label="Hide Network"
                  active={config.is_hidden}
                  onClick={() => updateSetting("is_hidden", !config.is_hidden)}
                  color="gray"
                />
              </div>
            </div>

            {/* 2. DNS Settings */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold">DNS Provider</h2>
              </div>

              <div className="space-y-3">
                <DNSOption
                  label="Cloudflare (Fastest)"
                  sub="1.1.1.1"
                  selected={config.dns_provider === "cloudflare"}
                  onClick={() => updateSetting("dns_provider", "cloudflare")}
                />
                <DNSOption
                  label="Google Public DNS"
                  sub="8.8.8.8"
                  selected={config.dns_provider === "google"}
                  onClick={() => updateSetting("dns_provider", "google")}
                />
                <DNSOption
                  label="ISP Default"
                  sub="Automatic"
                  selected={config.dns_provider === "isp"}
                  onClick={() => updateSetting("dns_provider", "isp")}
                />
              </div>
            </div>

            {/* 3. Firewall & Security */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold">Firewall</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f2f7]">
                  <span className="font-semibold text-gray-700">
                    Block Incoming Threats
                  </span>
                  <Switch
                    active={config.firewall_enabled}
                    onChange={() =>
                      updateSetting(
                        "firewall_enabled",
                        !config.firewall_enabled
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f2f7]">
                  <span className="font-semibold text-gray-700">
                    UPnP (Gaming)
                  </span>
                  <Switch
                    active={config.upnp_enabled}
                    onChange={() =>
                      updateSetting("upnp_enabled", !config.upnp_enabled)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f2f7]">
                  <span className="font-semibold text-gray-700">
                    Guest Network
                  </span>
                  <Switch
                    active={config.guest_network}
                    onChange={() =>
                      updateSetting("guest_network", !config.guest_network)
                    }
                  />
                </div>
              </div>
            </div>

            {/* 4. Port Forwarding (Simplified) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Server size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Port Forwarding</h2>
                    <p className="text-sm text-gray-400">
                      Allow external access to devices
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPort(true)}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* List of Rules */}
              <div className="space-y-3">
                {config.port_rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <div className="font-bold text-gray-900">
                          {rule.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {rule.device_ip}:{rule.port} • {rule.protocol}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removePortRule(rule.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {config.port_rules.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No active port forwarding rules.
                  </div>
                )}
              </div>

              {/* Add Rule Modal/Inline */}
              <AnimatePresence>
                {showAddPort && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        placeholder="Service Name (e.g. Minecraft)"
                        className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none"
                        value={newPortName}
                        onChange={(e) => setNewPortName(e.target.value)}
                      />
                      <input
                        placeholder="Device IP (192.168.1.X)"
                        className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none"
                        value={newPortIP}
                        onChange={(e) => setNewPortIP(e.target.value)}
                      />
                      <input
                        placeholder="Port (e.g. 25565)"
                        type="number"
                        className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none"
                        value={newPortNum}
                        onChange={(e) => setNewPortNum(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddPort}
                          className="flex-1 bg-black text-white rounded-lg text-sm font-bold"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddPort(false)}
                          className="px-3 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function ToggleCard({ icon, label, active, onClick, color }: any) {
  const activeColors: any = {
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    gray: "bg-gray-200 text-gray-700 border-gray-300",
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
        active
          ? activeColors[color] || "bg-blue-100 text-blue-700 border-blue-200"
          : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
      <div className="text-[10px] mt-1 opacity-75">
        {active ? "Enabled" : "Disabled"}
      </div>
    </button>
  );
}

function DNSOption({ label, sub, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
        selected
          ? "bg-black text-white border-black shadow-lg scale-[1.02]"
          : "bg-[#f2f2f7] text-gray-600 border-transparent hover:bg-gray-200"
      }`}
    >
      <div className="text-left">
        <div className="font-bold text-sm">{label}</div>
        <div
          className={`text-xs ${selected ? "text-gray-400" : "text-gray-500"}`}
        >
          {sub}
        </div>
      </div>
      {selected && (
        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
      )}
    </button>
  );
}

function Switch({ active, onChange }: any) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${
        active ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
