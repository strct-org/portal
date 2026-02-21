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
  Smartphone,
  Laptop,
  Ban,
  Gauge,
  Tv,
  Users,
  Zap,
  Check,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouterSettings } from "@/api.device";


type Device = {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: "mobile" | "laptop" | "tv" | "other";
  usage_rx: string; // download speed (from iftop/vnstat)
  usage_tx: string; // upload speed
  blocked: boolean;
  limited: boolean;
  limit_mbps: number; // wondershaper/tc rate limit
  signal_dbm?: number; // from iw dev wlan0 station dump
};

type BandwidthLimit = { label: string; mbps: number };
const BANDWIDTH_LIMITS: BandwidthLimit[] = [
  { label: "0.5 Mbps", mbps: 0.5 },
  { label: "1 Mbps", mbps: 1 },
  { label: "2 Mbps", mbps: 2 },
  { label: "5 Mbps", mbps: 5 },
  { label: "10 Mbps", mbps: 10 },
];

const CHANNELS_24 = [1, 6, 11];
const CHANNELS_5 = [36, 40, 44, 48, 149, 153, 157, 161];

// ─── Mock devices (replace with useConnectedDevices() hook in prod) ──────────

const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    name: "Admin iPhone",
    ip: "192.168.1.5",
    mac: "A1:B2:C3:D4:E5:F6",
    type: "mobile",
    usage_rx: "1.2 MB/s",
    usage_tx: "120 KB/s",
    blocked: false,
    limited: false,
    limit_mbps: 5,
    signal_dbm: -52,
  },
  {
    id: "2",
    name: "Living Room TV",
    ip: "192.168.1.12",
    mac: "AA:BB:CC:DD:EE:FF",
    type: "tv",
    usage_rx: "4.5 MB/s",
    usage_tx: "80 KB/s",
    blocked: false,
    limited: true,
    limit_mbps: 5,
    signal_dbm: -67,
  },
  {
    id: "3",
    name: "Unknown Device",
    ip: "192.168.1.24",
    mac: "11:22:33:44:55:66",
    type: "laptop",
    usage_rx: "12 KB/s",
    usage_tx: "8 KB/s",
    blocked: true,
    limited: false,
    limit_mbps: 0,
    signal_dbm: -81,
  },
  {
    id: "4",
    name: "Work Laptop",
    ip: "192.168.1.31",
    mac: "DE:AD:BE:EF:CA:FE",
    type: "laptop",
    usage_rx: "800 KB/s",
    usage_tx: "200 KB/s",
    blocked: false,
    limited: false,
    limit_mbps: 0,
    signal_dbm: -44,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [limitTarget, setLimitTarget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "wifi" | "devices" | "firewall" | "dns" | "ports"
  >("wifi");

  // Port form state
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

  // POST /api/router/block  →  iptables -A/-D INPUT/FORWARD -m mac --mac-source MAC -j DROP
  const toggleBlock = (id: string) => {
    setDevices((ds) =>
      ds.map((d) => (d.id === id ? { ...d, blocked: !d.blocked } : d)),
    );
  };

  // POST /api/router/limit  →  tc qdisc add dev wlan0 root htb ... + tc filter match ip dst IP
  const setLimit = (id: string, mbps: number) => {
    setDevices((ds) =>
      ds.map((d) =>
        d.id === id ? { ...d, limited: mbps > 0, limit_mbps: mbps } : d,
      ),
    );
    setLimitTarget(null);
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border border-[#333] animate-spin border-t-emerald-400" />
          <Wifi
            className="absolute inset-0 m-auto text-emerald-400"
            size={18}
          />
        </div>
        <p className="text-[#666] font-mono text-sm tracking-widest uppercase">
          Connecting to device
        </p>
      </div>
    );
  }

  const freq = config.frequency || "5GHz";
  const channelOptions = freq === "5GHz" ? CHANNELS_5 : CHANNELS_24;

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-mono text-[#e8e8e8]">
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[560px] z-50"
          >
            <div className="bg-[#111] border border-emerald-500/30 text-white p-4 rounded-2xl shadow-[0_0_40px_rgba(52,211,153,0.15)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-300">
                  Unsaved changes
                </span>
              </div>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Apply Config
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-[#1a1a1a] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#555] hover:text-[#e8e8e8] transition-colors text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="w-px h-4 bg-[#222]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-[#888]">Orange Pi 3B</span>
              <span className="text-[#333]">·</span>
              <span className="text-sm text-[#555] font-mono">
                {deviceId?.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="text-sm text-[#333] font-mono uppercase tracking-widest">
            Router Control
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 flex gap-1 pb-0">
          {(
            [
              ["wifi", "Wi-Fi", Wifi],
              ["devices", "Devices", Users],
              ["firewall", "Firewall", ShieldCheck],
              ["dns", "DNS", Globe],
              ["ports", "Ports", Server],
            ] as [string, string, any][]
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === key
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-[#444] hover:text-[#888]"
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {activeTab === "wifi" && (
          <motion.div
            key="wifi"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <SectionHeader
              title="Wireless Settings"
              sub="Writes /etc/hostapd/hostapd.conf → systemctl restart hostapd"
              icon={<Wifi size={16} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Network Name (SSID)" hint="hostapd: ssid=">
                <TermInput
                  value={config.ssid}
                  onChange={(v) => updateSetting("ssid", v)}
                />
              </Field>
              <Field label="Password" hint="hostapd: wpa_passphrase=">
                <div className="relative">
                  <TermInput
                    value={config.password}
                    onChange={(v) => updateSetting("password", v)}
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Frequency Band"
                hint={`hostapd: hw_mode=${freq === "5GHz" ? "a" : "g"}`}
              >
                <div className="flex gap-2">
                  {["2.4GHz", "5GHz"].map((b) => (
                    <ToggleChip
                      key={b}
                      active={freq === b}
                      onClick={() => {
                        updateSetting("frequency", b);
                        updateSetting("channel", b === "5GHz" ? 36 : 6);
                      }}
                    >
                      {b}
                    </ToggleChip>
                  ))}
                </div>
              </Field>
              <Field
                label="Channel"
                hint={`hostapd: channel=${config.channel || "auto"} — less interference on non-overlapping channels`}
              >
                <div className="flex flex-wrap gap-2">
                  {channelOptions.map((ch) => (
                    <ToggleChip
                      key={ch}
                      active={config.channel === ch}
                      onClick={() => updateSetting("channel", ch)}
                    >
                      {ch}
                    </ToggleChip>
                  ))}
                </div>
              </Field>
            </div>

            {/* Security + Advanced toggles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FeatureCard
                icon={<Lock size={16} />}
                label="WPA3 Security"
                sub={
                  config.security_mode === "WPA3"
                    ? "hostapd: wpa=3"
                    : "hostapd: wpa=2"
                }
                active={config.security_mode === "WPA3"}
                onClick={() =>
                  updateSetting(
                    "security_mode",
                    config.security_mode === "WPA3" ? "WPA2" : "WPA3",
                  )
                }
                accent="emerald"
              />
              <FeatureCard
                icon={<EyeOff size={16} />}
                label="Hidden Network"
                sub="ignore_broadcast_ssid=1"
                active={config.is_hidden}
                onClick={() => updateSetting("is_hidden", !config.is_hidden)}
                accent="amber"
              />
              <FeatureCard
                icon={<Zap size={16} />}
                label="Signal Boost"
                sub={`iwconfig txpower ${config.tx_power === "30" ? "30dBm (max)" : "20dBm"}`}
                active={config.tx_power === "30"}
                onClick={() =>
                  updateSetting(
                    "tx_power",
                    config.tx_power === "30" ? "20" : "30",
                  )
                }
                accent="blue"
              />
              <FeatureCard
                icon={<Users size={16} />}
                label="Max Clients"
                sub={`hostapd: max_num_sta=${config.max_clients || 20}`}
                active={false}
                onClick={() => {}}
                accent="purple"
                customContent={
                  <select
                    value={config.max_clients || 20}
                    onChange={(e) =>
                      updateSetting("max_clients", parseInt(e.target.value))
                    }
                    className="mt-2 w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-[#e8e8e8] focus:outline-none focus:border-purple-500"
                  >
                    {[5, 10, 15, 20, 30, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} devices
                      </option>
                    ))}
                  </select>
                }
              />
            </div>

            <InfoBox>
              Changing SSID or password will disconnect all devices briefly
              while hostapd restarts. The Orange Pi itself will reconnect
              automatically.
            </InfoBox>
          </motion.div>
        )}

        {/* ── TAB: Connected Devices ─────────────────────────────────────────── */}
        {activeTab === "devices" && (
          <motion.div
            key="devices"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Connected Devices"
                sub="arp -a + ip neigh show | block via iptables | limit via tc htb"
                icon={<Users size={16} />}
              />
              <button className="flex items-center gap-2 text-xs text-[#444] hover:text-emerald-400 transition-colors border border-[#1e1e1e] hover:border-emerald-500/30 px-3 py-2 rounded-lg">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div className="space-y-2">
              {devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  onBlock={() => toggleBlock(device.id)}
                  onLimit={(mbps) => setLimit(device.id, mbps)}
                  limitTarget={limitTarget}
                  setLimitTarget={setLimitTarget}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatBox
                label="Active"
                value={`${devices.filter((d) => !d.blocked).length}`}
                sub="devices online"
                accent="emerald"
              />
              <StatBox
                label="Blocked"
                value={`${devices.filter((d) => d.blocked).length}`}
                sub="via iptables DROP"
                accent="red"
              />
              <StatBox
                label="Limited"
                value={`${devices.filter((d) => d.limited).length}`}
                sub="via tc htb"
                accent="amber"
              />
            </div>
          </motion.div>
        )}

        {/* ── TAB: Firewall ──────────────────────────────────────────────────── */}
        {activeTab === "firewall" && (
          <motion.div
            key="firewall"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <SectionHeader
              title="Firewall Rules"
              sub="iptables — controls what traffic enters, exits, and routes through the device"
              icon={<ShieldCheck size={16} />}
            />

            <div className="space-y-3">
              <FirewallRule
                label="Block All Incoming Connections"
                sub="iptables -P INPUT DROP (except established/related)"
                risk="low"
                active={config.firewall_enabled}
                onChange={() =>
                  updateSetting("firewall_enabled", !config.firewall_enabled)
                }
              />
              <FirewallRule
                label="Isolate Guest Devices"
                sub="iptables -A FORWARD -i wlan0 -o wlan0 -j DROP — prevents device-to-device traffic"
                risk="low"
                active={config.guest_isolation}
                onChange={() =>
                  updateSetting("guest_isolation", !config.guest_isolation)
                }
              />
              <FirewallRule
                label="Block Ping (ICMP)"
                sub="iptables -A INPUT -p icmp -j DROP — makes device invisible to scanners"
                risk="low"
                active={config.block_ping}
                onChange={() => updateSetting("block_ping", !config.block_ping)}
              />
              <FirewallRule
                label="IPv6 Firewall"
                sub="ip6tables -P INPUT DROP — same rules applied to IPv6 traffic"
                risk="low"
                active={config.ipv6_firewall}
                onChange={() =>
                  updateSetting("ipv6_firewall", !config.ipv6_firewall)
                }
              />
            </div>

            <InfoBox
              icon={<AlertTriangle size={14} className="text-amber-400" />}
            >
              Firewall rules apply immediately via iptables. Blocking all
              incoming connections still allows replies to connections you
              initiate (ESTABLISHED,RELATED).
            </InfoBox>
          </motion.div>
        )}

        {/* ── TAB: DNS ───────────────────────────────────────────────────────── */}
        {activeTab === "dns" && (
          <motion.div
            key="dns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <SectionHeader
              title="DNS Provider"
              sub="Writes /etc/resolv.conf — controls how domain names are resolved"
              icon={<Globe size={16} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(
                [
                  {
                    key: "cloudflare",
                    label: "Cloudflare",
                    ip: "1.1.1.1",
                    sub: "Fastest. Privacy-first. No logging.",
                    accent: "orange",
                  },
                  {
                    key: "google",
                    label: "Google",
                    ip: "8.8.8.8",
                    sub: "Reliable. Widely used.",
                    accent: "blue",
                  },
                  {
                    key: "adguard",
                    label: "AdGuard",
                    ip: "94.140.14.14",
                    sub: "Blocks ads + trackers at DNS level.",
                    accent: "green",
                  },
                  {
                    key: "quad9",
                    label: "Quad9",
                    ip: "9.9.9.9",
                    sub: "Blocks known malware domains.",
                    accent: "purple",
                  },
                  {
                    key: "isp",
                    label: "ISP Default",
                    ip: "auto (dhcp)",
                    sub: "Your provider's DNS. May log queries.",
                    accent: "gray",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => updateSetting("dns_provider", opt.key)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    config.dns_provider === opt.key
                      ? "bg-[#0f1a12] border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.08)]"
                      : "bg-[#0e0e0e] border-[#1e1e1e] hover:border-[#333]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{opt.label}</span>
                    <span className="font-mono text-xs text-[#444]">
                      {opt.ip}
                    </span>
                    {config.dns_provider === opt.key && (
                      <Check size={14} className="text-emerald-400 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-[#555]">{opt.sub}</p>
                </button>
              ))}
            </div>

            <InfoBox>
              DNS change takes effect immediately. All new domain lookups use
              the selected server. Active connections are not interrupted.
            </InfoBox>
          </motion.div>
        )}

        {/* ── TAB: Ports ─────────────────────────────────────────────────────── */}
        {activeTab === "ports" && (
          <motion.div
            key="ports"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Port Forwarding"
                sub="iptables -t nat -A PREROUTING -p tcp --dport X -j DNAT --to-destination IP:X"
                icon={<Server size={16} />}
              />
              <button
                onClick={() => setShowAddPort(true)}
                className="flex items-center gap-2 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg transition-colors font-bold"
              >
                <Plus size={12} /> Add Rule
              </button>
            </div>

            <AnimatePresence>
              {showAddPort && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-4 space-y-3">
                    <p className="text-xs text-[#444] font-mono uppercase tracking-widest">
                      New Forwarding Rule
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <TermInput
                        placeholder="Name (e.g. Web Server)"
                        value={newPortName}
                        onChange={setNewPortName}
                      />
                      <TermInput
                        placeholder="Device IP (192.168.1.X)"
                        value={newPortIP}
                        onChange={setNewPortIP}
                      />
                      <TermInput
                        placeholder="Port (e.g. 80)"
                        value={newPortNum}
                        onChange={setNewPortNum}
                        type="number"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddPort}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-colors py-2"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddPort(false)}
                          className="px-3 bg-[#1a1a1a] text-[#888] rounded-lg text-xs font-bold hover:bg-[#222] transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#333] font-mono">
                      → iptables -t nat -A PREROUTING -p tcp --dport{" "}
                      {newPortNum || "?"} -j DNAT --to-destination{" "}
                      {newPortIP || "?"} + FORWARD ACCEPT
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {config.port_rules.length === 0 && !showAddPort ? (
                <div className="text-center py-12 text-[#333] text-sm border border-dashed border-[#1a1a1a] rounded-xl">
                  No port rules active. Click "Add Rule" to expose a service.
                </div>
              ) : (
                config.port_rules.map((rule: any) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl hover:border-[#2a2a2a] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                        <span className="font-bold text-sm">{rule.name}</span>
                        <span className="font-mono text-xs text-[#444]">
                          {rule.protocol}
                        </span>
                      </div>
                      <p className="text-xs text-[#444] font-mono ml-4 mt-1">
                        :{rule.port} → {rule.device_ip}:{rule.port}
                      </p>
                    </div>
                    <button
                      onClick={() => removePortRule(rule.id)}
                      className="text-[#333] hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <InfoBox>
              Port rules use NAT DNAT to redirect inbound traffic from the
              Orange Pi&apos;s public IP to a device on your local network.
              MASQUERADE is applied so replies route correctly.
            </InfoBox>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ─── Device Row ───────────────────────────────────────────────────────────────

function DeviceRow({
  device,
  onBlock,
  onLimit,
  limitTarget,
  setLimitTarget,
}: {
  device: Device;
  onBlock: () => void;
  onLimit: (mbps: number) => void;
  limitTarget: string | null;
  setLimitTarget: (id: string | null) => void;
}) {
  const DevIcon =
    device.type === "mobile" ? Smartphone : device.type === "tv" ? Tv : Laptop;

  const signalStrength = device.signal_dbm
    ? device.signal_dbm > -60
      ? "Excellent"
      : device.signal_dbm > -70
        ? "Good"
        : device.signal_dbm > -80
          ? "Fair"
          : "Weak"
    : null;

  const signalColor = device.signal_dbm
    ? device.signal_dbm > -60
      ? "text-emerald-400"
      : device.signal_dbm > -70
        ? "text-blue-400"
        : device.signal_dbm > -80
          ? "text-amber-400"
          : "text-red-400"
    : "text-[#444]";

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        device.blocked
          ? "bg-red-950/20 border-red-900/30"
          : "bg-[#0e0e0e] border-[#1e1e1e]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${device.blocked ? "bg-red-900/40 text-red-400" : "bg-[#1a1a1a] text-[#666]"}`}
          >
            <DevIcon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{device.name}</span>
              {device.blocked && (
                <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                  BLOCKED
                </span>
              )}
              {device.limited && (
                <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded font-bold">
                  {device.limit_mbps}Mbps
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#444] font-mono">
                {device.ip}
              </span>
              <span className="text-[#2a2a2a]">·</span>
              <span className="text-[10px] text-[#333] font-mono">
                {device.mac}
              </span>
              {signalStrength && (
                <>
                  <span className="text-[#2a2a2a]">·</span>
                  <span className={`text-[10px] font-mono ${signalColor}`}>
                    {device.signal_dbm}dBm ({signalStrength})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!device.blocked && (
            <div className="text-right mr-3 hidden sm:block">
              <div className="text-[10px] text-emerald-400 font-mono">
                ↓ {device.usage_rx}
              </div>
              <div className="text-[10px] text-blue-400 font-mono">
                ↑ {device.usage_tx}
              </div>
            </div>
          )}

          {/* Bandwidth limit button */}
          <div className="relative">
            <button
              onClick={() =>
                setLimitTarget(limitTarget === device.id ? null : device.id)
              }
              title="Set bandwidth limit (tc htb)"
              className={`p-2 rounded-lg transition-colors text-xs ${
                device.limited
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-[#444] hover:text-[#888] hover:bg-[#1a1a1a]"
              }`}
            >
              <Gauge size={16} />
            </button>
            <AnimatePresence>
              {limitTarget === device.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-[#111] border border-[#2a2a2a] rounded-xl p-2 z-20 min-w-[160px] shadow-xl"
                >
                  <p className="text-[9px] text-[#444] font-mono uppercase tracking-widest mb-2 px-1">
                    tc htb rate limit
                  </p>
                  <button
                    onClick={() => onLimit(0)}
                    className="w-full text-left px-2 py-1.5 text-xs text-[#888] hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    No limit
                  </button>
                  {BANDWIDTH_LIMITS.map((opt) => (
                    <button
                      key={opt.mbps}
                      onClick={() => onLimit(opt.mbps)}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors ${
                        device.limit_mbps === opt.mbps && device.limited
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-[#888] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Block button */}
          <button
            onClick={onBlock}
            title={
              device.blocked
                ? "Unblock (iptables -D)"
                : "Block (iptables -A -j DROP)"
            }
            className={`p-2 rounded-lg transition-colors ${
              device.blocked
                ? "bg-red-600 text-white"
                : "text-[#444] hover:text-red-500 hover:bg-red-950/30"
            }`}
          >
            <Ban size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────

function SectionHeader({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <div className="p-2 bg-[#111] border border-[#1e1e1e] rounded-lg text-emerald-400 mt-0.5">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-base">{title}</h2>
        <p className="text-[10px] text-[#444] font-mono mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
          {label}
        </label>
        {hint && (
          <p className="text-[9px] text-[#333] font-mono mt-0.5">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function TermInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#0e0e0e] border border-[#1e1e1e] hover:border-[#2a2a2a] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-sm font-mono text-[#e8e8e8] focus:outline-none transition-colors placeholder-[#333]"
    />
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
        active
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
          : "bg-[#0e0e0e] text-[#555] border border-[#1e1e1e] hover:border-[#2a2a2a]"
      }`}
    >
      {children}
    </button>
  );
}

function FeatureCard({
  icon,
  label,
  sub,
  active,
  onClick,
  accent,
  customContent,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
  accent: string;
  customContent?: React.ReactNode;
}) {
  const accentMap: Record<string, string> = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/40   bg-amber-500/10   text-amber-400",
    blue: "border-blue-500/40    bg-blue-500/10    text-blue-400",
    purple: "border-purple-500/40  bg-purple-500/10  text-purple-400",
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        active ? accentMap[accent] : "bg-[#0e0e0e] border-[#1e1e1e] text-[#555]"
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wide">
            {label}
          </span>
        </div>
        <p className="text-[9px] font-mono opacity-60 leading-relaxed">{sub}</p>
      </button>
      {customContent}
    </div>
  );
}

function FirewallRule({
  label,
  sub,
  risk,
  active,
  onChange,
}: {
  label: string;
  sub: string;
  risk: "low" | "medium" | "high";
  active: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        active
          ? "bg-[#0f1a12] border-emerald-900/50"
          : "bg-[#0e0e0e] border-[#1e1e1e]"
      }`}
    >
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-[#444] font-mono mt-0.5">{sub}</p>
      </div>
      <Switch active={active} onChange={onChange} />
    </div>
  );
}

function Switch({
  active,
  onChange,
}: {
  active: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${active ? "bg-emerald-500" : "bg-[#2a2a2a]"}`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${active ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function StatBox({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
  };
  return (
    <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold font-mono ${colorMap[accent]}`}>
        {value}
      </div>
      <div className="text-[10px] text-[#444] uppercase tracking-widest mt-1">
        {sub}
      </div>
    </div>
  );
}

function InfoBox({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[#0e0e10] border border-[#1e1e2a] rounded-xl">
      <div className="text-[#444] mt-0.5 flex-shrink-0">
        {icon || <Cpu size={14} className="text-[#444]" />}
      </div>
      <p className="text-[11px] text-[#444] font-mono leading-relaxed">
        {children}
      </p>
    </div>
  );
}
