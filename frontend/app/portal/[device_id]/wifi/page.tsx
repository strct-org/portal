"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, WifiOff, Router, Radio, Eye, EyeOff,
  RefreshCw, Lock, Check, AlertTriangle, Search, Wifi,
  Activity, Users, Globe,
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

type WiFiStatus = {
  mode: Mode;
  active: boolean;
  ssid?: string;
  ap_interface?: string;
  subnet_base?: string;
  gateway_ip?: string;
  connected_ips: number;
  upstream_ssid?: string;
  error?: string;
};

type ScannedNetwork = {
  ssid: string;
  signal_dbm: number;
  frequency: string;
  encrypted: boolean;
  mac: string;
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
  { key: "cloudflare", label: "Cloudflare", ip: "1.1.1.1",        desc: "Fastest · privacy-first" },
  { key: "google",     label: "Google",     ip: "8.8.8.8",         desc: "Reliable · widely used" },
  { key: "adguard",    label: "AdGuard",    ip: "94.140.14.14",    desc: "Blocks ads at DNS level" },
  { key: "quad9",      label: "Quad9",      ip: "9.9.9.9",         desc: "Blocks malware domains" },
];


function apiBase(deviceId: string) {
  // In production the Next.js proxy rewrites /device/[id]/api/* → http://device/api/*
  // In dev everything hits the local agent directly via the frp tunnel
  return `/device/${deviceId}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WiFiPage() {
  const params   = useParams();
  const pageRouter = useRouter();
  const deviceId = params.device_id as string;
  const base     = apiBase(deviceId);

  const [config,       setConfig]       = useState<WiFiConfig>(DEFAULT_CONFIG);
  const [status,       setStatus]       = useState<WiFiStatus>({ mode: "off", active: false, connected_ips: 0 });
  const [selectedMode, setSelectedMode] = useState<Mode>("off");
  const [applying,     setApplying]     = useState(false);
  const [stopping,     setStopping]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [scanning,     setScanning]     = useState(false);
  const [networks,     setNetworks]     = useState<ScannedNetwork[]>([]);
  const [showNets,     setShowNets]     = useState(false);
  const [showPwd,      setShowPwd]      = useState(false);
  const [showUpPwd,    setShowUpPwd]    = useState(false);
  const [lastError,    setLastError]    = useState<string | null>(null);

  // ── Load config + status on mount ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [cfgRes, stRes] = await Promise.all([
        fetch(`${base}/api/wifi/config`),
        fetch(`${base}/api/wifi/status`),
      ]);
      if (cfgRes.ok) {
        const cfg: WiFiConfig = await cfgRes.json();
        setConfig(cfg);
        setSelectedMode(cfg.mode);
      }
      if (stRes.ok) {
        const st: WiFiStatus = await stRes.json();
        setStatus(st);
        if (st.error) setLastError(st.error);
      }
    } catch (e) {
      setLastError("Could not reach device");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Poll status every 10s when active
  useEffect(() => {
    if (!status.active) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${base}/api/wifi/status`);
        if (res.ok) setStatus(await res.json());
      } catch {}
    }, 10_000);
    return () => clearInterval(id);
  }, [status.active, base]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateRouter   = (k: keyof RouterConfig,   v: any) => setConfig(c => ({ ...c, router:   { ...c.router,   [k]: v } }));
  const updateExtender = (k: keyof ExtenderConfig, v: any) => setConfig(c => ({ ...c, extender: { ...c.extender, [k]: v } }));

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = async () => {
    setApplying(true);
    setLastError(null);
    const payload: WiFiConfig = { ...config, mode: selectedMode };
    try {
      const res = await fetch(`${base}/api/wifi/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text();
        setLastError(body || `HTTP ${res.status}`);
        return;
      }
      setConfig(payload);
      // Poll until active (backend applies async)
      let tries = 0;
      const poll = setInterval(async () => {
        tries++;
        const st = await fetch(`${base}/api/wifi/status`).then(r => r.json()).catch(() => null);
        if (st?.active || tries > 10) {
          clearInterval(poll);
          if (st) setStatus(st);
          setApplying(false);
        }
      }, 1500);
    } catch (e: any) {
      setLastError(e.message);
      setApplying(false);
    }
  };

  // ── Stop ───────────────────────────────────────────────────────────────────
  const handleStop = async () => {
    setStopping(true);
    try {
      await fetch(`${base}/api/wifi/stop`, { method: "POST" });
      setSelectedMode("off");
      setStatus(s => ({ ...s, active: false, mode: "off" }));
    } finally {
      setStopping(false);
    }
  };

  // ── Scan ───────────────────────────────────────────────────────────────────
  const scanNetworks = async () => {
    setScanning(true);
    setShowNets(true);
    try {
      const res  = await fetch(`${base}/api/wifi/scan`);
      const data: ScannedNetwork[] = await res.json();
      setNetworks(data.sort((a, b) => b.signal_dbm - a.signal_dbm));
    } catch {
      setNetworks([]);
    } finally {
      setScanning(false);
    }
  };

  const signalBars = (dbm: number) => dbm > -50 ? 4 : dbm > -65 ? 3 : dbm > -75 ? 2 : 1;

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#070710] text-[#c8cfe8]"
         style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', 'Cascadia Code', monospace" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#12121e] sticky top-0 z-40 bg-[#070710]/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => pageRouter.back()}
                    className="text-[#333] hover:text-[#666] transition-colors flex items-center gap-1.5 text-xs">
              <ArrowLeft size={13} /> back
            </button>
            <div className="w-px h-4 bg-[#151525]" />
            <div>
              <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-[#6b7fd4]">
                WiFi Control
              </h1>
              <p className="text-[9px] text-[#252535] mt-0.5 font-mono">
                {deviceId?.slice(0, 12)}
              </p>
            </div>
          </div>

          <StatusPill status={status} onRefresh={fetchAll} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-7">

        {/* ── Error banner ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {lastError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-start gap-3 p-3 bg-[#1a0808] border border-[#3a1010] rounded-xl text-xs text-red-400">
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
              <span>{lastError}</span>
              <button onClick={() => setLastError(null)} className="ml-auto text-[#444] hover:text-[#888]">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mode selector ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel>mode</SectionLabel>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {([
              { mode: "off",      icon: <WifiOff size={16} />,  label: "Off",      sub: "disabled",               color: "gray"   },
              { mode: "router",   icon: <Router  size={16} />,  label: "Router",   sub: "eth0 → wlan0 AP + NAT",  color: "blue"   },
              { mode: "extender", icon: <Radio   size={16} />,  label: "Extender", sub: "wlan0 client → wlan0_ap", color: "purple" },
            ] as const).map(({ mode, icon, label, sub, color }) => (
              <ModeCard key={mode} mode={mode} selected={selectedMode === mode}
                        active={status.active && status.mode === mode}
                        icon={icon} label={label} sub={sub} color={color}
                        onClick={() => setSelectedMode(mode)} />
            ))}
          </div>
        </div>

        {/* ── Config panels ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {selectedMode === "router" && (
            <motion.div key="router" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">

              {/* AP Settings */}
              <Panel title="access point" hint="hostapd.conf">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SSID" hint="ssid=">
                    <MonoInput value={config.router.ssid} onChange={v => updateRouter("ssid", v)} placeholder="StrctNet" />
                  </Field>
                  <Field label="Password" hint="wpa_passphrase=  (≥8 chars)">
                    <PasswordInput value={config.router.password} onChange={(v: string) => updateRouter("password", v)}
                                   show={showPwd} setShow={setShowPwd} />
                  </Field>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <Field label="Band" hint={`hw_mode=${config.router.band === "5GHz" ? "a" : "g"}`}>
                    <div className="space-y-1">
                      {(["2.4GHz", "5GHz"] as const).map(b => (
                        <Chip key={b} active={config.router.band === b}
                              onClick={() => { updateRouter("band", b); updateRouter("channel", b === "5GHz" ? 36 : 6); }}>
                          {b}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Channel" hint="non-overlapping">
                    <div className="grid grid-cols-2 gap-1">
                      {CHANNELS[config.router.band].map(ch => (
                        <Chip key={ch} active={config.router.channel === ch} onClick={() => updateRouter("channel", ch)}>
                          {ch}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Max Clients" hint="max_num_sta=">
                    <SelectInput value={config.router.max_clients}
                                 onChange={v => updateRouter("max_clients", parseInt(v))}
                                 options={[5,10,15,20,30,50].map(n => ({ value: String(n), label: String(n) }))} />
                  </Field>
                  <Field label="Subnet" hint="dhcp-range=">
                    <SelectInput value={config.router.subnet_base}
                                 onChange={v => updateRouter("subnet_base", v)}
                                 options={["192.168.100","192.168.101","10.0.1"].map(s => ({ value: s, label: `${s}.x` }))} />
                  </Field>
                </div>
              </Panel>

              {/* DNS */}
              <Panel title="dns provider" hint="dnsmasq: server=">
                <div className="grid grid-cols-2 gap-2">
                  {DNS_OPTIONS.map(opt => (
                    <button key={opt.key} onClick={() => updateRouter("dns_provider", opt.key as any)}
                            className={`text-left p-3 rounded-lg border transition-all ${
                              config.router.dns_provider === opt.key
                                ? "bg-[#0b0d1a] border-[#6b7fd4]/40"
                                : "bg-[#0a0a14] border-[#141420] hover:border-[#202030]"
                            }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[9px] text-[#2a2a3a] font-mono">{opt.ip}</span>
                        {config.router.dns_provider === opt.key && <Check size={9} className="text-[#6b7fd4] ml-1" />}
                      </div>
                      <p className="text-[9px] text-[#333]">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Note: Ad-blocking and VPN are configured in their own pages */}
              <div className="flex items-start gap-2 p-3 bg-[#0a0a14] border border-[#141420] rounded-xl text-[10px] text-[#333]">
                <Globe size={11} className="mt-0.5 flex-shrink-0 text-[#2a2a3a]" />
                <span>Ad-blocking and VPN (Tailscale) are configured separately in their own panels. They read the active WiFi subnet automatically.</span>
              </div>
            </motion.div>
          )}

          {selectedMode === "extender" && (
            <motion.div key="extender" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">

              {/* Bandwidth warning */}
              <div className="flex items-start gap-2.5 p-3 bg-[#130f00] border border-[#302000] rounded-xl">
                <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#665533] leading-relaxed">
                  <span className="text-amber-500 font-bold">Single-radio mode:</span>{" "}
                  wlan0 runs as client + AP simultaneously (ap+sta). Expect ~50% upstream bandwidth.
                  Plug in a USB WiFi dongle and enable &ldquo;Use Second Radio&rdquo; for full bandwidth.
                </p>
              </div>

              {/* Upstream */}
              <Panel title="upstream network" hint="wpa_supplicant -i wlan0">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Network to Extend" hint="ssid=">
                    <div className="relative">
                      <MonoInput value={config.extender.upstream_ssid}
                                 onChange={v => updateExtender("upstream_ssid", v)}
                                 placeholder="Existing WiFi SSID" />
                      <button onClick={scanNetworks}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2a2a3a] hover:text-[#6b7fd4] transition-colors">
                        <Search size={13} />
                      </button>
                    </div>
                  </Field>
                  <Field label="Password" hint="psk=">
                    <PasswordInput value={config.extender.upstream_password}
                                   onChange={(v: string) => updateExtender("upstream_password", v)}
                                   show={showUpPwd} setShow={setShowUpPwd} />
                  </Field>
                </div>

                {/* Network list */}
                <AnimatePresence>
                  {showNets && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                      <div className="bg-[#080810] border border-[#131320] rounded-xl">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#131320]">
                          <span className="text-[9px] text-[#252535] uppercase tracking-widest">
                            iw dev wlan0 scan
                          </span>
                          <div className="flex items-center gap-2">
                            {scanning && <RefreshCw size={9} className="animate-spin text-[#333]" />}
                            <button onClick={() => setShowNets(false)} className="text-[#252535] hover:text-[#555] text-xs">✕</button>
                          </div>
                        </div>
                        <div className="p-1.5 space-y-0.5 max-h-56 overflow-y-auto">
                          {scanning ? (
                            <div className="text-center py-6 text-[#252535] text-xs">scanning...</div>
                          ) : networks.length === 0 ? (
                            <div className="text-center py-6 text-[#252535] text-xs">no networks found</div>
                          ) : networks.map(net => (
                            <button key={net.mac} onClick={() => { updateExtender("upstream_ssid", net.ssid); setShowNets(false); }}
                                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#0e0e1c] transition-colors text-left group">
                              <div className="flex items-center gap-2.5">
                                <SignalBars bars={signalBars(net.signal_dbm)} />
                                <div>
                                  <div className="text-xs font-bold group-hover:text-[#c8cfe8]">
                                    {net.ssid || <span className="text-[#333] italic">hidden</span>}
                                  </div>
                                  <div className="text-[9px] text-[#252535] font-mono">
                                    {net.frequency} · {net.signal_dbm} dBm
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {net.encrypted && <Lock size={9} className="text-[#2a2a3a]" />}
                                {config.extender.upstream_ssid === net.ssid && <Check size={10} className="text-[#6b7fd4]" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Panel>

              {/* Extended AP */}
              <Panel title="extended ap" hint="hostapd on wlan0_ap">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="New SSID" hint="ssid=  (on wlan0_ap)">
                    <MonoInput value={config.extender.extender_ssid}
                               onChange={v => updateExtender("extender_ssid", v)}
                               placeholder="StrctNet-Ext" />
                  </Field>
                  <Field label="New Password" hint="wpa_passphrase=">
                    <MonoInput value={config.extender.extender_password}
                               onChange={v => updateExtender("extender_password", v)}
                               type="password" placeholder="min 8 chars" />
                  </Field>
                </div>

                <div className="mt-3">
                  <ToggleRow
                    enabled={config.extender.use_second_radio}
                    onChange={v => updateExtender("use_second_radio", v)}
                    icon={<Radio size={13} />}
                    label="Use Second Radio (USB dongle)"
                    hint="hostapd on wlan1 — each radio gets full bandwidth"
                  />
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1">
          {selectedMode !== "off" && (
            <button onClick={handleApply} disabled={applying}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#6b7fd4] hover:bg-[#7b8fe0] text-[#07070f] font-bold py-3 px-6 rounded-xl transition-colors text-xs disabled:opacity-40">
              {applying
                ? <><RefreshCw size={12} className="animate-spin" /> applying...</>
                : <><Check size={12} /> apply {selectedMode} mode</>
              }
            </button>
          )}
          {status.active && (
            <button onClick={handleStop} disabled={stopping}
                    className="flex items-center gap-2 bg-[#0e0e18] hover:bg-[#141420] text-[#555] border border-[#1a1a28] font-bold py-3 px-5 rounded-xl transition-colors text-xs">
              {stopping ? <RefreshCw size={12} className="animate-spin" /> : <WifiOff size={12} />}
              stop
            </button>
          )}
        </div>

        {/* ── Live status ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {status.active && (
            <motion.div key="status-card"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="bg-[#080f08] border border-[#162016] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#0f1a0f]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3dba6a] animate-pulse" />
                <span className="text-xs font-bold text-[#3dba6a] tracking-wide">
                  {status.mode === "router" ? "router active" : "extender active"}
                </span>
                <span className="text-[9px] text-[#1a3a1a] ml-auto font-mono">
                  {status.ap_interface}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#0f1a0f]">
                <StatCell icon={<Wifi size={11} />}       label="ssid"    value={status.ssid     || "—"} />
                <StatCell icon={<Users size={11} />}      label="devices" value={String(status.connected_ips)} sub="connected" />
                <StatCell icon={<Activity size={11} />}   label="gateway" value={status.gateway_ip || "—"} />
                <StatCell icon={<Globe size={11} />}      label="subnet"  value={status.subnet_base ? `${status.subnet_base}.0/24` : "—"} />
              </div>
              {status.upstream_ssid && (
                <div className="px-5 py-2 border-t border-[#0f1a0f] text-[10px] text-[#1e4a1e] font-mono">
                  upstream: {status.upstream_ssid}
                </div>
              )}
              {status.error && (
                <div className="px-5 py-2 border-t border-[#2a0808] flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle size={11} /> {status.error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center">
      <div className="text-center space-y-3">
        <RefreshCw size={18} className="animate-spin text-[#252535] mx-auto" />
        <p className="text-[10px] text-[#252535] font-mono tracking-widest">loading...</p>
      </div>
    </div>
  );
}

function StatusPill({ status, onRefresh }: { status: WiFiStatus; onRefresh: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onRefresh} className="text-[#252535] hover:text-[#555] transition-colors p-1">
        <RefreshCw size={11} />
      </button>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold ${
        status.active
          ? "bg-[#080f08] border-[#152015] text-[#3dba6a]"
          : "bg-[#0e0e14] border-[#181820] text-[#333]"
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${status.active ? "bg-[#3dba6a] animate-pulse" : "bg-[#252535]"}`} />
        {status.active ? (status.ssid || status.mode) : "inactive"}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] text-[#252535] uppercase tracking-[0.2em] font-bold">{children}</p>
  );
}

function ModeCard({ mode, selected, active, icon, label, sub, color, onClick }: {
  mode: Mode; selected: boolean; active: boolean;
  icon: React.ReactNode; label: string; sub: string; color: string;
  onClick: () => void;
}) {
  const ring = {
    gray:   selected ? "border-[#252535] bg-[#0e0e18]" : "border-[#111118] bg-[#090912] hover:border-[#1a1a28]",
    blue:   selected ? "border-[#6b7fd4]/40 bg-[#090b18]" : "border-[#111118] bg-[#090912] hover:border-[#1a1a28]",
    purple: selected ? "border-[#9b7fd4]/40 bg-[#0c0918]" : "border-[#111118] bg-[#090912] hover:border-[#1a1a28]",
  }[color] ?? "";

  const iconColor = {
    gray:   selected ? "text-[#555]"     : "text-[#252535]",
    blue:   selected ? "text-[#6b7fd4]"  : "text-[#252535]",
    purple: selected ? "text-[#9b7fd4]"  : "text-[#252535]",
  }[color] ?? "text-[#252535]";

  return (
    <button onClick={onClick} className={`text-left p-4 rounded-xl border transition-all ${ring}`}>
      <div className={`mb-2.5 ${iconColor}`}>{icon}</div>
      <div className="text-xs font-bold mb-0.5">{label}</div>
      <div className="text-[9px] text-[#252535] font-mono leading-relaxed">{sub}</div>
      {active && (
        <div className="flex items-center gap-1 mt-2">
          <div className="w-1 h-1 rounded-full bg-[#3dba6a] animate-pulse" />
          <span className="text-[9px] text-[#3dba6a]">running</span>
        </div>
      )}
    </button>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a14] border border-[#131320] rounded-2xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-bold tracking-wide">{title}</h3>
        <span className="text-[9px] text-[#1e1e2e] font-mono">{hint}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-[9px] font-bold text-[#333] uppercase tracking-widest">{label}</label>
        {hint && <p className="text-[8px] text-[#1a1a28] font-mono mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function MonoInput({ value, onChange, type = "text", placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
           className="w-full bg-[#080810] border border-[#131320] hover:border-[#1e1e2e] focus:border-[#6b7fd4]/40
                      rounded-lg px-3 py-2 text-xs font-mono text-[#c8cfe8] focus:outline-none
                      transition-colors placeholder-[#1a1a28]" />
  );
}

function PasswordInput({ value, onChange, show, setShow }: {
  value: string; onChange: (v: string) => void; show: boolean; setShow: (v: boolean) => void;
}) {
  return (
    <div className="relative">
      <MonoInput value={value} onChange={onChange} type={show ? "text" : "password"} placeholder="min 8 chars" />
      <button onClick={() => setShow(!show)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#252535] hover:text-[#555] transition-colors">
        {show ? <EyeOff size={11} /> : <Eye size={11} />}
      </button>
    </div>
  );
}

function SelectInput({ value, onChange, options }: {
  value: string | number; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={String(value)} onChange={e => onChange(e.target.value)}
            className="w-full bg-[#080810] border border-[#131320] hover:border-[#1e1e2e] rounded-lg px-3 py-2
                       text-xs text-[#c8cfe8] font-mono focus:outline-none focus:border-[#6b7fd4]/40 transition-colors">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
            className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all text-center ${
              active
                ? "bg-[#6b7fd4]/15 text-[#6b7fd4] border border-[#6b7fd4]/30"
                : "bg-[#080810] text-[#333] border border-[#131320] hover:border-[#1e1e2e]"
            }`}>
      {children}
    </button>
  );
}

function ToggleRow({ enabled, onChange, icon, label, hint }: {
  enabled: boolean; onChange: (v: boolean) => void;
  icon: React.ReactNode; label: string; hint: string;
}) {
  return (
    <button onClick={() => onChange(!enabled)}
            className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all text-left ${
              enabled
                ? "bg-[#0c0918] border-[#9b7fd4]/30 text-[#9b7fd4]"
                : "bg-[#080810] border-[#131320] text-[#333] hover:border-[#1e1e2e]"
            }`}>
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <div className="text-xs font-bold">{label}</div>
          <div className="text-[9px] font-mono text-[#252535] mt-0.5">{hint}</div>
        </div>
      </div>
      <Switch active={enabled} />
    </button>
  );
}

function Switch({ active }: { active: boolean }) {
  return (
    <div className={`relative w-8 h-4 rounded-full flex-shrink-0 transition-colors duration-200 ${active ? "bg-[#9b7fd4]/60" : "bg-[#131320]"}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${active ? "translate-x-4" : "translate-x-0.5"}`} />
    </div>
  );
}

function SignalBars({ bars }: { bars: number }) {
  return (
    <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0">
      {[1,2,3,4].map((b,i) => (
        <div key={b} className="w-0.5 rounded-sm transition-colors"
             style={{ height: `${25*b}%`, backgroundColor: i < bars ? "#6b7fd4" : "#1e1e2e" }} />
      ))}
    </div>
  );
}

function StatCell({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="px-4 py-3 space-y-1">
      <div className="flex items-center gap-1.5 text-[#1e3a1e]">{icon}
        <span className="text-[8px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-xs font-bold font-mono text-[#c8cfe8]">{value}</div>
      {sub && <div className="text-[8px] text-[#1e3a1e]">{sub}</div>}
    </div>
  );
}