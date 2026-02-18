"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Smartphone,
  Laptop,
  Ban,
  Gauge,
  Signal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouterSettings } from "@/api.device";

// Mock data to simulate 'arp -a' and 'iftop' results
const MOCK_DEVICES = [
  {
    id: 1,
    name: "Admin iPhone",
    ip: "192.168.1.5",
    mac: "A1:B2:C3:D4:E5",
    type: "mobile",
    usage: "1.2 MB/s",
    blocked: false,
    limited: false,
  },
  {
    id: 2,
    name: "Living Room TV",
    ip: "192.168.1.12",
    mac: "AA:BB:CC:DD:EE",
    type: "other",
    usage: "450 KB/s",
    blocked: false,
    limited: true,
  },
  {
    id: 3,
    name: "Unknown Device",
    ip: "192.168.1.24",
    mac: "11:22:33:44:55",
    type: "laptop",
    usage: "12 KB/s",
    blocked: true,
    limited: false,
  },
];

export default function RouterDashboard() {
    const params = useParams();
  const deviceId = params.device_id as string;

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
  } = useRouterSettings(deviceId);

  const [showPassword, setShowPassword] = useState(false);
  const [showAddPort, setShowAddPort] = useState(false);

  // State for Connected Devices (arp -a / iptables)
  const [devices, setDevices] = useState(MOCK_DEVICES);

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

  // Toggle Block (iptables DROP)
  const toggleBlockDevice = (id: number) => {
    setDevices(
      devices.map((d) => (d.id === id ? { ...d, blocked: !d.blocked } : d))
    );
    // In real app: call API to run `iptables -A INPUT -m mac --mac-source ... -j DROP`
  };

  // Toggle Rate Limit (wondershaper)
  const toggleLimitDevice = (id: number) => {
    setDevices(
      devices.map((d) => (d.id === id ? { ...d, limited: !d.limited } : d))
    );
    // In real app: call API to run `wondershaper`
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        <p className="text-gray-500 font-medium">Connecting to Orange Pi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f]">
      {/* Sticky Bottom Save Bar */}
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
                <span className="font-medium">Configuration changed</span>
              </div>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                {saving ? "Running Scripts..." : "Apply Config"}
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
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1d1d1f]">
              Router Control Center
            </h1>
            <p className="text-gray-500 mt-2">
              Manage Wi-Fi, Firewall, and Connected Devices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Wifi size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Wireless Settings</h2>
                  <p className="text-xs text-gray-400">hostapd configuration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    SSID Name
                  </label>
                  <input
                    type="text"
                    value={config.ssid}
                    onChange={(e) => updateSetting("ssid", e.target.value)}
                    className="w-full bg-[#f2f2f7] border-none rounded-xl px-4 py-3 font-semibold text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

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

              {/* Advanced Wi-Fi Toggles */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <ToggleCard
                  icon={<Lock size={18} />}
                  label="WPA3 Only"
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
                  icon={<Signal size={18} />}
                  label="Signal Boost"
                  subLabel="30dBm Power"
                  active={config.tx_power === "30"}
                  onClick={() =>
                    updateSetting(
                      "tx_power",
                      config.tx_power === "30" ? "20" : "30"
                    )
                  }
                  color="purple"
                />
                <ToggleCard
                  icon={<EyeOff size={18} />}
                  label="Hidden Net"
                  subLabel="No Broadcast"
                  active={config.is_hidden}
                  onClick={() => updateSetting("is_hidden", !config.is_hidden)}
                  color="gray"
                />
                <ToggleCard
                  icon={<Zap size={18} />}
                  label="5GHz"
                  active={config.frequency === "5GHz"}
                  onClick={() =>
                    updateSetting(
                      "frequency",
                      config.frequency === "5GHz" ? "2.4GHz" : "5GHz"
                    )
                  }
                  color="blue"
                />
              </div>
            </div>

            {/* 2. Connected Devices (New Section for Kick/Limit) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Connected Devices</h2>
                    <p className="text-xs text-gray-400">
                      {devices.length} active •{" "}
                      {devices.filter((d) => d.blocked).length} blocked
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
                  Live Traffic
                </div>
              </div>

              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      device.blocked
                        ? "bg-red-50 border-red-100 opacity-75"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          device.blocked
                            ? "bg-red-200 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {device.type === "mobile" ? (
                          <Smartphone size={18} />
                        ) : (
                          <Laptop size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {device.name}
                          {device.blocked && (
                            <span className="text-[10px] bg-red-600 text-white px-1.5 rounded">
                              BLOCKED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {device.ip} • {device.mac}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                      {/* Bandwidth Usage (iftop) */}
                      {!device.blocked && (
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-gray-700 flex items-center gap-1 justify-end">
                            <Activity size={12} className="text-blue-500" />
                            {device.usage}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Current Usage
                          </div>
                        </div>
                      )}

                      <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block" />

                      {/* Action Buttons */}
                      <button
                        onClick={() => toggleLimitDevice(device.id)}
                        title="Limit Bandwidth"
                        className={`p-2 rounded-lg transition-colors ${
                          device.limited
                            ? "bg-yellow-100 text-yellow-600"
                            : "hover:bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Gauge size={18} />
                      </button>

                      <button
                        onClick={() => toggleBlockDevice(device.id)}
                        title="Block Device"
                        className={`p-2 rounded-lg transition-colors ${
                          device.blocked
                            ? "bg-red-600 text-white shadow-md"
                            : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <Ban size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. DNS Settings */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold">DNS Provider</h2>
              </div>

              <div className="space-y-3">
                <DNSOption
                  label="Cloudflare (1.1.1.1)"
                  sub="Fastest / Privacy Focused"
                  selected={config.dns_provider === "cloudflare"}
                  onClick={() => updateSetting("dns_provider", "cloudflare")}
                />
                <DNSOption
                  label="Google (8.8.8.8)"
                  sub="Reliable / Standard"
                  selected={config.dns_provider === "google"}
                  onClick={() => updateSetting("dns_provider", "google")}
                />
                <DNSOption
                  label="ISP Default"
                  sub="Automatic Assignment"
                  selected={config.dns_provider === "isp"}
                  onClick={() => updateSetting("dns_provider", "isp")}
                />
              </div>
            </div>

            {/* 4. Firewall & Security */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold">Firewall Rules</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f2f7]">
                  <span className="font-semibold text-gray-700 text-sm">
                    Block Incoming (UFW)
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
                  <span className="font-semibold text-gray-700 text-sm">
                    Isolate Guest Network
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

            {/* 5. Port Forwarding */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Server size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Port Forwarding</h2>
                    <p className="text-sm text-gray-400">
                      Expose internal services
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPort(true)}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {config.port_rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      <div>
                        <div className="font-bold text-gray-900">
                          {rule.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {rule.device_ip}:{rule.port}{" "}
                          <span className="text-gray-300">|</span>{" "}
                          {rule.protocol}
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
                {config.port_rules.length === 0 && !showAddPort && (
                  <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No active rules. Click + to add one.
                  </div>
                )}
              </div>

              {/* Add Rule Form */}
              <AnimatePresence>
                {showAddPort && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        placeholder="Name (e.g. Web)"
                        className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100"
                        value={newPortName}
                        onChange={(e) => setNewPortName(e.target.value)}
                      />
                      <input
                        placeholder="IP (192.168.1.X)"
                        className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100"
                        value={newPortIP}
                        onChange={(e) => setNewPortIP(e.target.value)}
                      />
                      <input
                        placeholder="Port (e.g. 80)"
                        type="number"
                        className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100"
                        value={newPortNum}
                        onChange={(e) => setNewPortNum(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddPort}
                          className="flex-1 bg-black text-white rounded-lg text-sm font-bold shadow-md hover:bg-gray-800"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddPort(false)}
                          className="px-3 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100"
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

function ToggleCard({ icon, label, subLabel, active, onClick, color }: any) {
  const activeColors: any = {
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    gray: "bg-gray-200 text-gray-700 border-gray-300",
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
        active
          ? activeColors[color] ||
            "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
          : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
      {subLabel && (
        <div className="text-[10px] opacity-75 mt-0.5">{subLabel}</div>
      )}

      {active && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current opacity-50" />
      )}
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
      className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        active ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
