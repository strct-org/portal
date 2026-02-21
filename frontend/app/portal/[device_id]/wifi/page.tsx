"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  WifiOff,
  Router,
  Radio,
  Shield,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Check,
  AlertTriangle,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


type Mode = "off" | "router" | "extender";

type RouterConfig = {
  ssid: string;
  password: string;
  band: "2.4GHz" | "5GHz";
  channel: number;
  max_clients: number;
  subnet_base: string;
  ad_block_enabled: boolean;
  vpn_enabled: boolean;
  dns_provider: "cloudflare" | "google" | "adguard" | "quad9";
};

type ExtenderConfig = {
  upstream_ssid: string;
  upstream_password: string;
  extender_ssid: string;
  extender_password: string;
  extender_band: "2.4GHz" | "5GHz";
  use_second_radio: boolean;
};

type WiFiConfig = {
  mode: Mode;
  router: RouterConfig;
  extender: ExtenderConfig;
};

type ScannedNetwork = {
  ssid: string;
  signal_dbm: number;
  frequency: string;
  encrypted: boolean;
  mac: string;
};

type Status = {
  mode: Mode;
  active: boolean;
  ssid?: string;
  connected_ips: number;
  upstream_ssid?: string;
  tailscale_up?: boolean;
  ad_block_active?: boolean;
  error?: string;
};


const DEFAULT_CONFIG: WiFiConfig = {
  mode: "off",
  router: {
    ssid: "StrctNet",
    password: "",
    band: "5GHz",
    channel: 36,
    max_clients: 20,
    subnet_base: "192.168.100",
    ad_block_enabled: false,
    vpn_enabled: false,
    dns_provider: "cloudflare",
  },
  extender: {
    upstream_ssid: "",
    upstream_password: "",
    extender_ssid: "StrctNet-Ext",
    extender_password: "",
    extender_band: "5GHz",
    use_second_radio: false,
  },
};

const CHANNELS: Record<string, number[]> = {
  "2.4GHz": [1, 6, 11],
  "5GHz": [36, 40, 44, 48, 149, 153, 157, 161],
};

const DNS_OPTIONS = [
  {
    key: "cloudflare",
    label: "Cloudflare",
    ip: "1.1.1.1",
    desc: "Fastest + privacy-first",
  },
  {
    key: "google",
    label: "Google",
    ip: "8.8.8.8",
    desc: "Reliable, widely used",
  },
  {
    key: "adguard",
    label: "AdGuard",
    ip: "94.140.14.14",
    desc: "Blocks ads at DNS level",
  },
  {
    key: "quad9",
    label: "Quad9",
    ip: "9.9.9.9",
    desc: "Blocks malware domains",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WiFiPage() {
  const params = useParams();
  const deviceId = params.device_id as string;
  const router = useRouter();

  const [config, setConfig] = useState<WiFiConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<Status>({
    mode: "off",
    active: false,
    connected_ips: 0,
  });
  const [applying, setApplying] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<ScannedNetwork[]>([]);
  const [showNetworkList, setShowNetworkList] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUpstreamPassword, setShowUpstreamPassword] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>("off");

  const updateRouter = (k: keyof RouterConfig, v: any) =>
    setConfig((c) => ({ ...c, router: { ...c.router, [k]: v } }));
  const updateExtender = (k: keyof ExtenderConfig, v: any) =>
    setConfig((c) => ({ ...c, extender: { ...c.extender, [k]: v } }));

  const handleApply = async () => {
    setApplying(true);
    const payload = { ...config, mode: selectedMode };
    try {
      await fetch(`/api/wifi/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setConfig(payload);
    } finally {
      setTimeout(() => setApplying(false), 2000);
    }
  };

  const handleStop = async () => {
    await fetch(`/api/wifi/stop`, { method: "POST" });
    setSelectedMode("off");
    setStatus((s) => ({ ...s, active: false, mode: "off" }));
  };

  const scanNetworks = async () => {
    setScanning(true);
    setShowNetworkList(true);
    try {
      const res = await fetch(`/api/wifi/scan`);
      const data: ScannedNetwork[] = await res.json();
      setNetworks(data.sort((a, b) => b.signal_dbm - a.signal_dbm));
    } catch {
      setNetworks([]);
    } finally {
      setScanning(false);
    }
  };

  const signalBars = (dbm: number) => {
    if (dbm > -50) return 4;
    if (dbm > -65) return 3;
    if (dbm > -75) return 2;
    return 1;
  };

  const isConfigured = selectedMode !== "off";
  const hasChanges =
    selectedMode !== status.mode ||
    JSON.stringify(config) !== JSON.stringify(DEFAULT_CONFIG);

  return (
    <div
      className="min-h-screen bg-[#080810] text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      {/* Header */}
      <header className="border-b border-[#151520] sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[#444] hover:text-[#888] transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase text-[#7b8cde]">
                WiFi Control
              </h1>
              <p className="text-[10px] text-[#333] mt-0.5">
                Orange Pi 3B · {deviceId?.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Live status pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
              status.active
                ? "bg-[#0a1a0a] border-[#1a4a1a] text-[#4ade80]"
                : "bg-[#1a1a1a] border-[#2a2a2a] text-[#444]"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${status.active ? "bg-[#4ade80] animate-pulse" : "bg-[#333]"}`}
            />
            {status.active ? `${status.ssid || "Active"}` : "Inactive"}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* ── Mode Selection ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] text-[#333] uppercase tracking-widest mb-4">
            Select Mode
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ModeCard
              mode="off"
              selected={selectedMode === "off"}
              onClick={() => setSelectedMode("off")}
              icon={<WifiOff size={20} />}
              title="Off"
              description="Disable WiFi features"
              color="gray"
              detail={null}
            />
            <ModeCard
              mode="router"
              selected={selectedMode === "router"}
              onClick={() => setSelectedMode("router")}
              icon={<Router size={20} />}
              title="Router / AP"
              description="Full access point with NAT"
              color="blue"
              detail={
                <div className="mt-3 space-y-1 text-[10px] text-[#446]">
                  <div>eth0 → Orange Pi → wlan0</div>
                  <div>hostapd + dnsmasq + iptables</div>
                  <div>optional: ad block + Tailscale VPN</div>
                </div>
              }
            />
            <ModeCard
              mode="extender"
              selected={selectedMode === "extender"}
              onClick={() => setSelectedMode("extender")}
              icon={<Radio size={20} />}
              title="Extender"
              description="Repeat an existing WiFi network"
              color="purple"
              detail={
                <div className="mt-3 space-y-1 text-[10px] text-[#446]">
                  <div>wlan0 (client) → wlan0_ap (AP)</div>
                  <div>ap+sta concurrent mode</div>
                  <div>~50% bandwidth on single radio</div>
                </div>
              }
            />
          </div>
        </div>

        {/* ── Router Config ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {selectedMode === "router" && (
            <motion.div
              key="router"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* AP Settings */}
              <Section
                title="Access Point"
                sub="hostapd.conf · creates the WiFi network"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Network Name (SSID)" hint="hostapd: ssid=">
                    <MonoInput
                      value={config.router.ssid}
                      onChange={(v) => updateRouter("ssid", v)}
                      placeholder="StrctNet"
                    />
                  </Field>
                  <Field
                    label="Password"
                    hint="hostapd: wpa_passphrase=  (min 8 chars)"
                  >
                    <PasswordInput
                      value={config.router.password}
                      onChange={(v: string) => updateRouter("password", v)}
                      show={showPassword}
                      setShow={setShowPassword}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Field
                    label="Band"
                    hint={`hw_mode=${config.router.band === "5GHz" ? "a" : "g"}`}
                  >
                    <div className="flex flex-col gap-1.5">
                      {(["2.4GHz", "5GHz"] as const).map((b) => (
                        <Chip
                          key={b}
                          active={config.router.band === b}
                          onClick={() => {
                            updateRouter("band", b);
                            updateRouter("channel", b === "5GHz" ? 36 : 6);
                          }}
                        >
                          {b}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field
                    label="Channel"
                    hint="non-overlapping reduces interference"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {CHANNELS[config.router.band].map((ch) => (
                        <Chip
                          key={ch}
                          active={config.router.channel === ch}
                          onClick={() => updateRouter("channel", ch)}
                        >
                          {ch}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Max Devices" hint="hostapd: max_num_sta=">
                    <select
                      value={config.router.max_clients}
                      onChange={(e) =>
                        updateRouter("max_clients", parseInt(e.target.value))
                      }
                      className="w-full bg-[#0e0e1a] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#dde1f0] focus:outline-none focus:border-[#7b8cde]/50"
                    >
                      {[5, 10, 15, 20, 30, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Subnet" hint="dnsmasq: dhcp-range=X.50 - X.150">
                    <select
                      value={config.router.subnet_base}
                      onChange={(e) =>
                        updateRouter("subnet_base", e.target.value)
                      }
                      className="w-full bg-[#0e0e1a] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#dde1f0] focus:outline-none focus:border-[#7b8cde]/50"
                    >
                      {["192.168.100", "192.168.101", "10.0.1"].map((s) => (
                        <option key={s} value={s}>
                          {s}.x
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Section>

              {/* DNS */}
              <Section
                title="DNS Provider"
                sub="dnsmasq: --server=  · resolves domain names for all connected devices"
              >
                <div className="grid grid-cols-2 gap-2">
                  {DNS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() =>
                        updateRouter("dns_provider", opt.key as any)
                      }
                      className={`text-left p-3 rounded-lg border transition-all ${
                        config.router.dns_provider === opt.key
                          ? "bg-[#0e1020] border-[#7b8cde]/40"
                          : "bg-[#0c0c16] border-[#1a1a28] hover:border-[#2a2a3a]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] text-[#333] font-mono">
                          {opt.ip}
                        </span>
                        {config.router.dns_provider === opt.key && (
                          <Check size={10} className="text-[#7b8cde] ml-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#444] mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Features */}
              <Section
                title="Network Features"
                sub="optional services applied on top of the base AP"
              >
                <div className="space-y-3">
                  <FeatureToggle
                    enabled={config.router.ad_block_enabled}
                    onChange={(v) => updateRouter("ad_block_enabled", v)}
                    icon={<Shield size={15} />}
                    title="Ad & Tracker Blocking"
                    description="Downloads StevenBlack/hosts (~100k domains) → dnsmasq address= directives. Every connected device gets network-wide ad blocking without any app."
                    command="curl github.com/StevenBlack/hosts → /etc/dnsmasq.d/adblock.conf → systemctl kill -s HUP dnsmasq"
                    color="green"
                  />
                  <FeatureToggle
                    enabled={config.router.vpn_enabled}
                    onChange={(v) => updateRouter("vpn_enabled", v)}
                    icon={<Zap size={15} />}
                    title="Whole-Home VPN (Tailscale)"
                    description="Orange Pi becomes a Tailscale subnet router. Every device on the AP gets VPN without installing Tailscale. Approve the route at tailscale.com/admin after enabling."
                    command={`tailscale up --advertise-routes=${config.router.subnet_base}.0/24 --advertise-exit-node`}
                    color="blue"
                    warning="Requires a Tailscale account and approving the subnet route in the admin console."
                  />
                </div>
              </Section>
            </motion.div>
          )}

          {/* ── Extender Config ──────────────────────────────────────────────── */}
          {selectedMode === "extender" && (
            <motion.div
              key="extender"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* Radio warning */}
              <div className="flex items-start gap-3 p-4 bg-[#1a1200] border border-[#3a2800] rounded-xl">
                <AlertTriangle
                  size={14}
                  className="text-amber-400 mt-0.5 flex-shrink-0"
                />
                <div className="text-[11px] text-[#887755] leading-relaxed">
                  <strong className="text-amber-400">
                    Single radio (Orange Pi 3B default):
                  </strong>{" "}
                  wlan0 runs as both client and AP simultaneously using Linux
                  ap+sta mode. Both connections share the same radio, so expect
                  ~50% of upstream bandwidth. For full bandwidth, plug in a USB
                  WiFi dongle and enable &rdquo;Use Second Radio&rdquo; below.
                </div>
              </div>

              {/* Upstream network */}
              <Section
                title="Upstream Network"
                sub="the existing WiFi to connect to · wpa_supplicant -i wlan0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Network to Extend (SSID)"
                    hint="wpa_supplicant: ssid="
                  >
                    <div className="relative">
                      <MonoInput
                        value={config.extender.upstream_ssid}
                        onChange={(v) => updateExtender("upstream_ssid", v)}
                        placeholder="Your existing WiFi name"
                      />
                      <button
                        onClick={scanNetworks}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-[#444] hover:text-[#7b8cde] transition-colors"
                      >
                        <Search size={14} />
                      </button>
                    </div>
                  </Field>
                  <Field label="Password" hint="wpa_supplicant: psk=">
                    <PasswordInput
                      value={config.extender.upstream_password}
                      onChange={(v: string) => updateExtender("upstream_password", v)}
                      show={showUpstreamPassword}
                      setShow={setShowUpstreamPassword}
                    />
                  </Field>
                </div>

                {/* Network scanner */}
                <AnimatePresence>
                  {showNetworkList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="bg-[#0a0a14] border border-[#1a1a28] rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-[#444] uppercase tracking-widest">
                            Visible networks · iw dev wlan0 scan
                          </span>
                          {scanning && (
                            <RefreshCw
                              size={10}
                              className="animate-spin text-[#444]"
                            />
                          )}
                        </div>
                        {scanning ? (
                          <div className="text-center py-4 text-[#333] text-xs">
                            Scanning...
                          </div>
                        ) : networks.length === 0 ? (
                          <div className="text-center py-4 text-[#333] text-xs">
                            No networks found
                          </div>
                        ) : (
                          networks.map((net) => (
                            <button
                              key={net.mac}
                              onClick={() => {
                                updateExtender("upstream_ssid", net.ssid);
                                setShowNetworkList(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#111120] transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <SignalBars bars={signalBars(net.signal_dbm)} />
                                <div>
                                  <div className="text-sm font-bold">
                                    {net.ssid || "(hidden)"}
                                  </div>
                                  <div className="text-[10px] text-[#444] font-mono">
                                    {net.frequency} · {net.signal_dbm} dBm
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {net.encrypted && (
                                  <Lock size={10} className="text-[#444]" />
                                )}
                                {config.extender.upstream_ssid === net.ssid && (
                                  <Check size={12} className="text-[#7b8cde]" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Section>

              {/* New extended network */}
              <Section
                title="Extended Network"
                sub="the new SSID you're creating · hostapd on wlan0_ap"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="New Network Name"
                    hint="hostapd: ssid= (on wlan0_ap)"
                  >
                    <MonoInput
                      value={config.extender.extender_ssid}
                      onChange={(v) => updateExtender("extender_ssid", v)}
                      placeholder="StrctNet-Ext"
                    />
                  </Field>
                  <Field
                    label="New Network Password"
                    hint="hostapd: wpa_passphrase="
                  >
                    <MonoInput
                      value={config.extender.extender_password}
                      onChange={(v) => updateExtender("extender_password", v)}
                      type="password"
                      placeholder="min 8 characters"
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <FeatureToggle
                    enabled={config.extender.use_second_radio}
                    onChange={(v) => updateExtender("use_second_radio", v)}
                    icon={<Radio size={15} />}
                    title="Use Second Radio (USB Dongle)"
                    description="Use wlan1 for the extended AP instead of a virtual interface. Each radio gets full bandwidth — no sharing. Requires a USB WiFi adapter plugged into the Orange Pi."
                    command="hostapd on wlan1 (full bandwidth) instead of wlan0_ap virtual interface"
                    color="purple"
                  />
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Apply / Stop buttons ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          {selectedMode !== "off" && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 flex items-center justify-center gap-2 bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] font-bold py-3 px-6 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {applying ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Applying...
                </>
              ) : (
                <>
                  <Check size={14} /> Apply{" "}
                  {selectedMode === "router" ? "Router Mode" : "Extender Mode"}
                </>
              )}
            </button>
          )}
          {status.active && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#888] border border-[#2a2a2a] font-bold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              <WifiOff size={14} /> Stop
            </button>
          )}
        </div>

        {/* ── Status card (when active) ─────────────────────────────────────── */}
        {status.active && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0f0a] border border-[#1a3a1a] rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              <span className="text-sm font-bold text-[#4ade80]">
                {status.mode === "router"
                  ? "Router Mode Active"
                  : "Extender Mode Active"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem label="SSID" value={status.ssid || "—"} />
              <StatItem
                label="Devices"
                value={`${status.connected_ips}`}
                sub="connected"
              />
              {status.ad_block_active && (
                <StatItem label="Ad Block" value="ON" accent="green" />
              )}
              {status.tailscale_up && (
                <StatItem
                  label="VPN"
                  value="Active"
                  sub="Tailscale"
                  accent="blue"
                />
              )}
              {status.upstream_ssid && (
                <StatItem label="Upstream" value={status.upstream_ssid} />
              )}
            </div>
            {status.error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle size={12} /> {status.error}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeCard({
  mode,
  selected,
  onClick,
  icon,
  title,
  description,
  color,
  detail,
}: any) {
  const colors: Record<string, string> = {
    gray: "border-[#2a2a3a] bg-[#0e0e1a]",
    blue: "border-[#7b8cde]/50 bg-[#0a0c1a] shadow-[0_0_30px_rgba(123,140,222,0.06)]",
    purple:
      "border-[#a78bde]/50 bg-[#0d0a1a] shadow-[0_0_30px_rgba(167,139,222,0.06)]",
  };
  const inactive = "border-[#151520] bg-[#0c0c14] hover:border-[#252535]";

  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all ${selected ? colors[color] : inactive}`}
    >
      <div
        className={`mb-3 ${selected ? (color === "blue" ? "text-[#7b8cde]" : color === "purple" ? "text-[#a78bde]" : "text-[#666]") : "text-[#333]"}`}
      >
        {icon}
      </div>
      <div className="font-bold text-sm">{title}</div>
      <div className="text-[11px] text-[#444] mt-1">{description}</div>
      {selected && detail}
    </button>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-[10px] text-[#333] font-mono mt-0.5">{sub}</p>
      </div>
      {children}
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
    <div className="space-y-1.5">
      <div>
        <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
          {label}
        </label>
        {hint && (
          <p className="text-[9px] text-[#2a2a3a] font-mono mt-0.5">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function MonoInput({
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
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-3 py-2.5 text-sm font-mono text-[#dde1f0] focus:outline-none transition-colors placeholder-[#2a2a3a]"
    />
  );
}

function PasswordInput({ value, onChange, show, setShow }: any) {
  return (
    <div className="relative">
      <MonoInput
        value={value}
        onChange={onChange}
        type={show ? "text" : "password"}
        placeholder="min 8 characters"
      />
      <button
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333] hover:text-[#666] transition-colors"
      >
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

function Chip({
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
      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all text-center ${
        active
          ? "bg-[#7b8cde]/20 text-[#7b8cde] border border-[#7b8cde]/40"
          : "bg-[#0e0e1a] text-[#444] border border-[#1a1a28] hover:border-[#2a2a38]"
      }`}
    >
      {children}
    </button>
  );
}

function FeatureToggle({
  enabled,
  onChange,
  icon,
  title,
  description,
  command,
  color,
  warning,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  command: string;
  color: string;
  warning?: string;
}) {
  const accent =
    color === "green"
      ? "text-[#4ade80] border-[#1a3a1a] bg-[#0a1a0a]"
      : color === "blue"
        ? "text-[#7b8cde] border-[#1a1e3a] bg-[#0a0c1a]"
        : "text-[#a78bde] border-[#2a1e3a] bg-[#0d0a1a]";

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${enabled ? accent : "border-[#151520] bg-[#0a0a12]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div
            className={`flex items-center gap-2 mb-1 ${enabled ? "" : "text-[#444]"}`}
          >
            {icon}
            <span className="text-sm font-bold">{title}</span>
          </div>
          <p className="text-[11px] text-[#444] leading-relaxed mb-2">
            {description}
          </p>
          <p className="text-[9px] font-mono text-[#2a2a3a] leading-relaxed">
            {command}
          </p>
          {warning && enabled && (
            <div className="flex items-start gap-1.5 mt-2">
              <AlertTriangle
                size={10}
                className="text-amber-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-[10px] text-amber-700">{warning}</p>
            </div>
          )}
        </div>
        <Switch active={enabled} onChange={() => onChange(!enabled)} />
      </div>
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
      className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${active ? "bg-[#4ade80]/70" : "bg-[#1e1e2e]"}`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${active ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function SignalBars({ bars }: { bars: number }) {
  const colors = [
    bars >= 1 ? "#7b8cde" : "#1e1e2e",
    bars >= 2 ? "#7b8cde" : "#1e1e2e",
    bars >= 3 ? "#7b8cde" : "#1e1e2e",
    bars >= 4 ? "#7b8cde" : "#1e1e2e",
  ];
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((b, i) => (
        <div
          key={b}
          className="w-1 rounded-sm"
          style={{ height: `${25 * b}%`, backgroundColor: colors[i] }}
        />
      ))}
    </div>
  );
}

function StatItem({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  const color =
    accent === "green"
      ? "text-[#4ade80]"
      : accent === "blue"
        ? "text-[#7b8cde]"
        : "text-[#dde1f0]";
  return (
    <div>
      <div className="text-[10px] text-[#444] uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#333]">{sub}</div>}
    </div>
  );
}
