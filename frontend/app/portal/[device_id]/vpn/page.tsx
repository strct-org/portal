"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Lock, MapPin, QrCode, Download, Smartphone, Laptop,
  Power, Globe, RefreshCw, ShieldCheck, AlertCircle, Terminal, X,
  Server, Key, Users, Network,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";
import { useDeviceVPNStats } from "@/api/device";
import { useState } from "react";
import Image from "next/image";

export default function LocalVPN() {
  const params   = useParams();
  const router   = useRouter();
  const deviceId = params.device_id as string;

  const { devices } = usePortal();
  const device = devices?.find((d) => d?.id === deviceId);

  const {
    vpnState, config, status,
    loading, error, processing,
    toggleExitNode, setEnabled, setAuthKey,
  } = useDeviceVPNStats(deviceId);

  const [showQr,     setShowQr]     = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft,   setKeyDraft]   = useState("");

  // ── Derived state from new Status shape ──────────────────────────────────
  const isEnabled     = status?.enabled        ?? false;
  const isUp          = status?.tailscale_up   ?? false;
  const isExitNode    = status?.exit_node_active ?? false;
  const tailscaleIP   = status?.tailscale_ip   ?? "";
  const subnet        = status?.advertised_subnet ?? "";
  const peerCount     = status?.peer_count     ?? 0;
  const remoteError   = status?.error;

  const isProvisioning = isEnabled && !isUp && !remoteError;
  const hasError       = !!remoteError || !!error;

  const handleToggleExit = () => toggleExitNode(!isExitNode);

  const handleToggleEnabled = () => setEnabled(!isEnabled);

  const handleSaveKey = async () => {
    if (!keyDraft.startsWith("tskey-")) return;
    await setAuthKey(keyDraft);
    setKeyDraft("");
    setShowKeyInput(false);
  };

  if (loading || !device) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center"
           style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#6b7fd4]" size={20} />
          <span className="text-[10px] text-[#333] uppercase tracking-[0.2em]">
            establishing secure tunnel...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070710] text-[#c8cfe8]"
         style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="border-b border-[#111118] sticky top-0 z-40 bg-[#070710]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/portal/${deviceId}`)}
                    className="text-[#333] hover:text-[#666] transition-colors flex items-center gap-1.5 text-xs uppercase tracking-widest">
              <ArrowLeft size={13} /> hub
            </button>
            <div className="w-px h-4 bg-[#131320]" />
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-[#6b7fd4]" />
              <div>
                <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b7fd4]">
                  {device.friendly_name}
                </h1>
                <p className="text-[8px] text-[#252535] mt-0.5 uppercase tracking-widest">vpn subsystem</p>
              </div>
            </div>
          </div>

          {/* Live connection status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
            isUp
              ? "bg-[#080f08] border-[#152015] text-[#3dba6a]"
              : isProvisioning
              ? "bg-[#0a0a14] border-[#1a1a28] text-[#6b7fd4]"
              : "bg-[#0e0e14] border-[#181820] text-[#333]"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              isUp ? "bg-[#3dba6a] animate-pulse" : isProvisioning ? "bg-[#6b7fd4] animate-pulse" : "bg-[#252535]"
            }`} />
            {isUp ? "connected" : isProvisioning ? "provisioning" : "offline"}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

          {/* ── Error banner ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {hasError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-start gap-3 p-3 mb-6 bg-[#130808] border border-[#2a1010] rounded-xl text-xs text-red-400">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span className="font-mono">{remoteError || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

            {/* Control card */}
            <div className="bg-[#0a0a14] rounded-2xl border border-[#131320] p-6 flex flex-col relative overflow-hidden">
              <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
                isExitNode ? "bg-[#3dba6a]/4 opacity-100" : "bg-[#6b7fd4]/4 opacity-0"
              }`} />

              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  isExitNode
                    ? "bg-[#080f08] border-[#152015] text-[#3dba6a]"
                    : "bg-[#080810] border-[#131320] text-[#333]"
                }`}>
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">network tunnel</h3>
                  <p className="text-[9px] text-[#252535] mt-0.5 font-mono">tailscale subnet router</p>
                </div>
              </div>

              <p className="text-[10px] text-[#333] leading-relaxed mb-6 flex-1">
                {isExitNode
                  ? "Exit node active — remote devices are routing encrypted traffic through this node."
                  : isUp
                  ? "Connected to tailnet. Enable exit node to route remote traffic through this device."
                  : "Initialize Tailscale to securely access devices on this network from anywhere."}
              </p>

              {/* Auth key input */}
              <AnimatePresence>
                {showKeyInput && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                    <div className="bg-[#080810] border border-[#131320] rounded-xl p-3 space-y-2">
                      <p className="text-[9px] text-[#252535] uppercase tracking-widest">
                        tailscale auth key — tailscale.com/admin/settings/keys
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={keyDraft}
                          onChange={e => setKeyDraft(e.target.value)}
                          placeholder="tskey-auth-xxxxx"
                          className="flex-1 bg-[#050508] border border-[#131320] rounded-lg px-3 py-2 text-xs font-mono
                                     text-[#c8cfe8] focus:outline-none focus:border-[#6b7fd4]/40 placeholder-[#1a1a28]"
                        />
                        <button onClick={handleSaveKey}
                                disabled={!keyDraft.startsWith("tskey-")}
                                className="px-3 py-2 bg-[#6b7fd4]/10 border border-[#6b7fd4]/30 text-[#6b7fd4]
                                           rounded-lg text-[10px] font-bold disabled:opacity-30 hover:bg-[#6b7fd4]/20 transition-colors">
                          save
                        </button>
                        <button onClick={() => { setShowKeyInput(false); setKeyDraft(""); }}
                                className="px-3 py-2 border border-[#131320] text-[#333] rounded-lg text-[10px] hover:text-[#666] transition-colors">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status row + actions */}
              {isProvisioning ? (
                <div className="bg-[#080810] border border-[#131320] text-[#6b7fd4] p-4 rounded-xl flex items-center gap-3">
                  <RefreshCw size={14} className="animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">provisioning...</p>
                    <p className="text-[8px] text-[#252535] mt-0.5">tailscale up running, approve subnet at tailscale.com/admin</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Tailscale IP / subnet */}
                  {isUp && (
                    <div className="flex items-center justify-between bg-[#080810] border border-[#131320] rounded-xl px-4 py-3 text-[10px] font-mono">
                      <div className="flex items-center gap-2 text-[#252535]">
                        <Network size={11} />
                        <span>{tailscaleIP || "—"}</span>
                        {subnet && <span className="text-[#131320]">· {subnet}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#252535]">
                        <Users size={10} /> <span>{peerCount} peers</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {/* Enable/disable */}
                    <button onClick={handleToggleEnabled} disabled={processing}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${
                              isEnabled
                                ? "bg-[#130808] border-[#2a1010] text-red-400 hover:border-red-400/30"
                                : "bg-[#080f08] border-[#152015] text-[#3dba6a] hover:border-[#3dba6a]/30"
                            }`}>
                      {processing ? <RefreshCw size={12} className="animate-spin" /> : <Power size={12} />}
                      {isEnabled ? "stop vpn" : "start vpn"}
                    </button>

                    {/* Exit node toggle — only when VPN is up */}
                    {isUp && (
                      <button onClick={handleToggleExit} disabled={processing}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${
                                isExitNode
                                  ? "bg-[#0a1a0a] border-[#1a3a1a] text-[#3dba6a]"
                                  : "bg-[#080810] border-[#131320] text-[#333] hover:border-[#252535]"
                              }`}>
                        {processing ? <RefreshCw size={12} className="animate-spin" /> : <Globe size={12} />}
                        {isExitNode ? "exit node on" : "exit node off"}
                      </button>
                    )}

                    {/* Auth key */}
                    <button onClick={() => setShowKeyInput(v => !v)}
                            className="p-2.5 border border-[#131320] text-[#252535] hover:text-[#555] hover:border-[#1e1e2e] rounded-xl transition-colors"
                            title="Set auth key">
                      <Key size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Visual node card */}
            <div className="bg-[#0a0a14] rounded-2xl border border-[#131320] flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[260px] p-6">
              {isUp && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <div className="w-72 h-72 border border-[#3dba6a] rounded-full animate-ping opacity-20 absolute" />
                  <div className="w-52 h-52 border border-[#3dba6a] rounded-full animate-ping opacity-40 absolute" style={{ animationDelay: "0.5s" }} />
                </div>
              )}

              <div className={`relative z-10 p-5 rounded-full mb-4 border transition-all duration-500 ${
                isExitNode
                  ? "bg-[#080f08] border-[#152015] shadow-[0_0_40px_rgba(61,186,106,0.12)]"
                  : isUp
                  ? "bg-[#0a0b14] border-[#1a1b28]"
                  : "bg-[#080810] border-[#131320]"
              }`}>
                {isExitNode
                  ? <ShieldCheck size={30} className="text-[#3dba6a]" />
                  : isUp
                  ? <Lock size={30} className="text-[#6b7fd4]" />
                  : <Globe size={30} className="text-[#252535]" />
                }
              </div>

              <h2 className="text-xs font-bold uppercase tracking-widest mb-1.5">
                {isExitNode ? "exit node active" : isUp ? "tailnet connected" : "node offline"}
              </h2>
              <p className="text-[9px] text-[#252535] max-w-[240px] leading-relaxed uppercase tracking-widest">
                {isExitNode
                  ? "remote devices routing encrypted traffic via this node"
                  : isUp
                  ? `connected to tailnet · ${peerCount} peer${peerCount !== 1 ? "s" : ""}`
                  : "start vpn to access this network remotely"}
              </p>

              <div className="mt-5 flex items-center gap-2 px-3 py-1.5 bg-[#080810] border border-[#131320] rounded-lg text-[9px] font-mono text-[#252535] uppercase tracking-widest">
                <MapPin size={9} /> {device.local_ip || "no ip"}
              </div>
            </div>
          </div>

          {/* ── Client instructions ─────────────────────────────────────── */}
          <div className={`transition-all duration-500 ${isUp ? "opacity-100" : "opacity-30 grayscale pointer-events-none"}`}>
            <p className="text-[9px] text-[#252535] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Server size={10} /> client setup
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="group bg-[#0a0a14] p-5 rounded-2xl border border-[#131320] hover:border-[#6b7fd4]/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#080810] border border-[#131320] text-[#6b7fd4] rounded-xl group-hover:scale-105 transition-transform">
                    <Smartphone size={17} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest">mobile</div>
                    <div className="text-[9px] text-[#252535] mt-0.5">iOS / Android</div>
                  </div>
                </div>
                <button onClick={() => setShowQr(true)}
                        className="px-3 py-2 bg-[#080810] hover:bg-[#0e0e18] border border-[#131320] text-[#c8cfe8]
                                   rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
                  <QrCode size={11} className="text-[#6b7fd4]" /> scan
                </button>
              </div>

              <div className="group bg-[#0a0a14] p-5 rounded-2xl border border-[#131320] hover:border-[#9b7fd4]/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#080810] border border-[#131320] text-[#9b7fd4] rounded-xl group-hover:scale-105 transition-transform">
                    <Laptop size={17} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest">desktop</div>
                    <div className="text-[9px] text-[#252535] mt-0.5">macOS · Windows · Linux</div>
                  </div>
                </div>
                <a href="https://tailscale.com/download" target="_blank" rel="noreferrer"
                   className="px-3 py-2 bg-[#080810] hover:bg-[#0e0e18] border border-[#131320] text-[#c8cfe8]
                              rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
                  <Download size={11} className="text-[#9b7fd4]" /> download
                </a>
              </div>
            </div>

            {/* Admin approval note */}
            {isEnabled && !isUp && (
              <p className="text-[9px] text-[#252535] mt-3 font-mono text-center">
                approve subnet route at tailscale.com/admin → machines → edit route settings
              </p>
            )}
          </div>
        </motion.div>
      </main>

      {/* ── QR Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#070710]/85 backdrop-blur-sm"
                        onClick={() => setShowQr(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-[#0a0a14] border border-[#131320] rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden">
              <div className="bg-[#080810] border-b border-[#131320] px-5 py-3.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <QrCode size={13} className="text-[#6b7fd4]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">client provisioning</span>
                </div>
                <button onClick={() => setShowQr(false)} className="text-[#333] hover:text-[#888] transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-xl mb-5 shadow-[0_0_30px_rgba(107,127,212,0.1)]">
                  <Image src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://tailscale.com/download"
                         width={180} height={180} alt="Tailscale download QR" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1.5">install tailscale</h4>
                <p className="text-[9px] text-[#252535] uppercase tracking-widest leading-relaxed">
                  scan to install · sign in with the same account · this device will appear automatically
                </p>
              </div>
              <div className="border-t border-[#131320] bg-[#080810] px-5 py-3.5">
                <button onClick={() => setShowQr(false)}
                        className="w-full py-2.5 rounded-xl border border-[#131320] hover:border-[#6b7fd4]/30
                                   text-[#c8cfe8] text-[10px] font-bold uppercase tracking-widest transition-colors">
                  close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}