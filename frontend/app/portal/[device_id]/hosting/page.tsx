"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  GitBranch,
  Database,
  HardDrive,
  Zap,
  RefreshCw,
  Play,
  ShieldCheck,
  Lock,
  Activity,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  Server,
  Code,
  Link as LinkIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWebHosting } from "@/api.device";

export default function HostingDashboard() {
  const router = useRouter();
  const {
    config,
    deployments,
    health,
    loading,
    isDeploying,
    toggleSetting,
    triggerDeploy,
    clearCache,
  } = useWebHosting();

  if (loading || !config) {
    return (
      <div
        className="min-h-screen bg-[#080810] flex items-center justify-center font-mono"
        style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
      >
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#7b8cde]" size={24} />
          <span className="text-[10px] text-[#555] uppercase tracking-widest">
            Initializing Hosting Environment...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#080810] text-[#dde1f0] selection:bg-[#7b8cde]/30 selection:text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      {/* Header */}
      <header className="border-b border-[#151520] sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[#444] hover:text-[#dde1f0] transition-colors flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold"
            >
              <ArrowLeft size={14} /> Hub
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#7b8cde]" />
              <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-[#7b8cde]">
                  Web Server
                </h1>
                <p className="text-[9px] text-[#555] mt-0.5 uppercase tracking-widest">
                  Nginx FastCGI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-10 px-6 pb-24 max-w-6xl mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#151522] pb-6 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#dde1f0] flex items-center gap-2">
                  {config.domain}
                </h1>
                <a
                  href={`https://${config.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#7b8cde]/50 rounded-lg transition-all shadow-sm group"
                >
                  <LinkIcon size={12} className="text-[#555] group-hover:text-[#7b8cde]" />
                </a>
              </div>
              <p className="text-[10px] text-[#555] mt-2 uppercase tracking-widest flex items-center gap-2">
                <GitBranch size={12} className="text-[#7b8cde]" />
                {config.repo}
                <span className="text-[#333]">/</span>
                <span className="text-[#7b8cde] bg-[#7b8cde]/10 border border-[#7b8cde]/20 px-1.5 py-0.5 rounded font-bold">
                  {config.branch}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={clearCache}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#2a2a3a] hover:bg-[#11111a] text-[#888] hover:text-[#dde1f0] rounded-lg font-bold transition-all text-xs uppercase tracking-widest flex-1 md:flex-none"
              >
                <RefreshCw size={12} /> Purge Cache
              </button>
              <button
                onClick={triggerDeploy}
                disabled={isDeploying}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] rounded-lg font-bold transition-all text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(123,140,222,0.15)] disabled:opacity-50 flex-1 md:flex-none"
              >
                {isDeploying ? (
                  <RefreshCw className="animate-spin text-[#080810]" size={14} />
                ) : (
                  <Play size={14} />
                )}
                {isDeploying ? "Deploying..." : "Deploy"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- LEFT COLUMN: Health & Settings --- */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Live Health Monitor */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="CPU Usage"
                  value={`${health.cpu_usage.toFixed(0)}%`}
                  color={health.cpu_usage > 80 ? "red" : "green"}
                  icon={<Activity size={14} />}
                />
                <StatCard
                  label="Memory"
                  value={`${health.ram_usage.toFixed(0)}%`}
                  color={health.ram_usage > 80 ? "orange" : "blue"}
                  icon={<Zap size={14} />}
                />
                <StatCard
                  label="Storage"
                  value={`${config.storage_used} GB`}
                  sub={`of ${config.storage_limit} GB`}
                  color="purple"
                  icon={<HardDrive size={14} />}
                />
                <StatCard
                  label="Response"
                  value={`${health.response_time}ms`}
                  color={health.response_time > 500 ? "red" : "green"}
                  icon={<Clock size={14} />}
                />
              </div>

              {/* 2. Deployment History */}
              <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#151522]">
                  <div className="p-2 bg-[#0a0a14] border border-[#1a1a28] rounded-lg text-[#555]">
                    <Terminal size={14} />
                  </div>
                  <h2 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
                    Build Logs & History
                  </h2>
                </div>

                <div className="space-y-0 pl-2">
                  {deployments.map((dep) => (
                    <div
                      key={dep.id}
                      className="relative pl-6 pb-6 last:pb-0 border-l border-[#1a1a28] last:border-transparent"
                    >
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0c0c16] ${
                          dep.status === "success"
                            ? "bg-[#4ade80]"
                            : dep.status === "building"
                            ? "bg-[#7b8cde] animate-pulse"
                            : "bg-[#f87171]"
                        }`}
                      />

                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 -mt-1.5">
                        <div>
                          <div className="text-sm font-bold text-[#dde1f0]">
                            {dep.message}
                          </div>
                          <div className="text-[10px] text-[#555] uppercase tracking-widest mt-1 flex items-center gap-2">
                            <span className="text-[#7b8cde]">{dep.commit}</span>
                            <span>•</span>
                            <span>{dep.timestamp}</span>
                          </div>
                        </div>
                        <StatusBadge status={dep.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Database & Files Quick View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1000] border border-[#4a2a0a] text-[#fbbf24] flex items-center justify-center">
                      <Database size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest">
                        Database Engine
                      </div>
                      <div className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">
                        MySQL 8.0
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a14] border border-[#1a1a28] p-3 rounded-xl mb-5 flex-1">
                    <div className="text-[10px] text-[#555] font-bold uppercase tracking-widest mb-1.5">
                      Target Schema
                    </div>
                    <div className="font-mono text-sm text-[#7b8cde]">
                      {config.db_name}
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-lg border border-[#1a1a28] bg-[#0e0e1a] text-[10px] font-bold text-[#888] hover:text-[#dde1f0] hover:border-[#2a2a3a] hover:bg-[#11111a] uppercase tracking-widest transition-colors">
                    Access phpMyAdmin
                  </button>
                </div>

                <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0a1a0a] border border-[#1a4a1a] text-[#4ade80] flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest">
                        SSL / TLS
                      </div>
                      <div className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">
                        Let&apos;s Encrypt Authority
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#0a1a0a] border border-[#1a4a1a] p-3 rounded-xl mb-5 flex-1">
                    <div className="text-xs font-bold text-[#4ade80] flex items-center gap-2 uppercase tracking-widest">
                      <Lock size={12} /> Secure
                    </div>
                    <div className="text-[9px] text-[#4ade80]/70 uppercase tracking-widest font-bold">
                      Auto-renews
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-lg border border-[#1a1a28] bg-[#0e0e1a] text-[10px] font-bold text-[#888] hover:text-[#dde1f0] hover:border-[#2a2a3a] hover:bg-[#11111a] uppercase tracking-widest transition-colors">
                    Inspect Certificate
                  </button>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: Configuration --- */}
            <div className="space-y-6">
              {/* Site Controls */}
              <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#151522]">
                  <Code size={14} className="text-[#7b8cde]" />
                  <h2 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
                    Environment Toggles
                  </h2>
                </div>

                <div className="space-y-6">
                  <ControlSwitch
                    label="Maintenance Mode"
                    description="Route traffic to offline page"
                    active={config.maintenance_mode}
                    onClick={() => toggleSetting("maintenance_mode")}
                  />
                  <ControlSwitch
                    label="Force HTTPS"
                    description="Strict Transport Security (HSTS)"
                    active={config.ssl_enabled}
                    onClick={() => toggleSetting("ssl_enabled")}
                  />
                  <ControlSwitch
                    label="Nginx Caching"
                    description="Enable FastCGI micro-cache"
                    active={config.caching_enabled}
                    onClick={() => toggleSetting("caching_enabled")}
                  />
                </div>
              </div>

              {/* Tech Stack Info */}
              <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#151522]">
                  <Server size={14} className="text-[#7b8cde]" />
                  <h2 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest">
                    Infrastructure
                  </h2>
                </div>
                <div className="space-y-1">
                  <TechRow
                    label="PHP Version"
                    value={`v${config.php_version}`}
                  />
                  <TechRow label="Web Server" value="Nginx" />
                  <TechRow label="OS Kernel" value="Ubuntu 22.04" />
                  <TechRow label="Datacenter" value="Frankfurt (EU)" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// --- Helper Components ---

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  const colors: Record<string, string> = {
    green: "text-[#4ade80] border-[#1a4a1a] bg-[#0a1a0a]",
    red: "text-[#f87171] border-[#4a1a1a] bg-[#1a0a0a]",
    blue: "text-[#7b8cde] border-[#1a1a28] bg-[#0a0c1a]",
    orange: "text-[#fbbf24] border-[#4a2a0a] bg-[#1a1000]",
    purple: "text-[#a78bde] border-[#2a1a3a] bg-[#0d0a1a]",
  };

  return (
    <div className="bg-[#0c0c16] p-4 rounded-xl border border-[#151522] shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <div
          className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colors[color] || colors.blue}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-[#555] text-[10px] font-bold uppercase tracking-widest mb-1">
          {label}
        </div>
        <div className="text-lg font-bold text-[#dde1f0]">{value}</div>
        {sub && (
          <div className="text-[9px] text-[#444] uppercase tracking-widest mt-0.5">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-[#4ade80] bg-[#0a1a0a] border border-[#1a4a1a] px-2 py-1 rounded">
        <CheckCircle2 size={10} /> Active
      </span>
    );
  }
  if (status === "building") {
    return (
      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-[#7b8cde] bg-[#0a0c1a] border border-[#1a1a28] px-2 py-1 rounded">
        <RefreshCw size={10} className="animate-spin" /> Building
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-[#f87171] bg-[#1a0a0a] border border-[#4a1a1a] px-2 py-1 rounded">
      <XCircle size={10} /> Failed
    </span>
  );
}

interface ControlSwitchProps {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function ControlSwitch({ label, description, active, onClick }: ControlSwitchProps) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <div className="font-bold text-[#dde1f0] text-xs uppercase tracking-widest mb-0.5">
          {label}
        </div>
        <div className="text-[10px] text-[#555]">{description}</div>
      </div>
      <button
        onClick={onClick}
        className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 border ${
          active
            ? "bg-[#7b8cde]/20 border-[#7b8cde]/50"
            : "bg-[#0a0a14] border-[#1a1a28]"
        }`}
      >
        <div
          className={`absolute top-[1.5px] w-3.5 h-3.5 rounded-full transition-transform duration-200 ${
            active ? "translate-x-4 bg-[#7b8cde]" : "translate-x-[2px] bg-[#444]"
          }`}
        />
      </button>
    </div>
  );
}

interface TechRowProps {
  label: string;
  value: string | number;
}

function TechRow({ label, value }: TechRowProps) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#151522] last:border-0">
      <span className="text-[10px] uppercase tracking-widest font-bold text-[#555]">
        {label}
      </span>
      <span className="text-xs font-bold text-[#dde1f0] font-mono">
        {value}
      </span>
    </div>
  );
}