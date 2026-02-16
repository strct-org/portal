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
      <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        <p className="text-gray-500 font-medium">Loading Site Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f]">
      <main className="pt-28 px-6 pb-24 max-w-[1100px] mx-auto min-h-screen">
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

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#1d1d1f]">
                  {config.domain}
                </h1>
                <a
                  href={`https://${config.domain}`}
                  target="_blank"
                  className="p-2 bg-white rounded-full hover:scale-110 transition-transform shadow-sm"
                >
                  <Globe size={16} className="text-blue-500" />
                </a>
              </div>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <GitBranch size={14} />
                {config.repo}
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {config.branch}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCache}
                className="px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} /> Purge Cache
              </button>
              <button
                onClick={triggerDeploy}
                disabled={isDeploying}
                className="px-6 py-2.5 bg-black text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                {isDeploying ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Play size={16} />
                )}
                {isDeploying ? "Deploying..." : "Deploy Now"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- LEFT COLUMN: Health & Settings --- */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Live Health Monitor */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="CPU Usage"
                  value={`${health.cpu_usage.toFixed(0)}%`}
                  color={health.cpu_usage > 80 ? "red" : "green"}
                  icon={<Activity size={18} />}
                />
                <StatCard
                  label="Memory"
                  value={`${health.ram_usage.toFixed(0)}%`}
                  color={health.ram_usage > 80 ? "orange" : "blue"}
                  icon={<Zap size={18} />}
                />
                <StatCard
                  label="Storage"
                  value={`${config.storage_used} GB`}
                  sub={`of ${config.storage_limit} GB`}
                  color="purple"
                  icon={<HardDrive size={18} />}
                />
                <StatCard
                  label="Response"
                  value={`${health.response_time}ms`}
                  color={health.response_time > 500 ? "red" : "green"}
                  icon={<Clock size={18} />}
                />
              </div>

              {/* 2. Deployment History */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Terminal size={18} className="text-gray-600" />
                    </div>
                    Recent Deployments
                  </h2>
                </div>

                <div className="space-y-0">
                  {deployments.map((dep, i) => (
                    <div
                      key={dep.id}
                      className="relative pl-8 pb-8 last:pb-0 border-l-2 border-gray-100 last:border-transparent"
                    >
                      <div
                        className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          dep.status === "success"
                            ? "bg-green-500"
                            : dep.status === "building"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-red-500"
                        }`}
                      />

                      <div className="flex justify-between items-start -mt-1">
                        <div>
                          <div className="font-bold text-gray-900">
                            {dep.message}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
                            <span>{dep.commit}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Database size={20} />
                    </div>
                    <div>
                      <div className="font-bold">Database</div>
                      <div className="text-xs text-gray-400">MySQL 8.0</div>
                    </div>
                  </div>

                  <div className="bg-[#f2f2f7] p-3 rounded-xl mb-4">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                      DB Name
                    </div>
                    <div className="font-mono text-sm text-gray-800">
                      {config.db_name}
                    </div>
                  </div>

                  <button className="w-full py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                    Open phpMyAdmin
                  </button>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="font-bold">SSL / HTTPS</div>
                      <div className="text-xs text-gray-400">
                        Let's Encrypt Authority
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl mb-4 border border-green-100">
                    <div className="text-sm font-bold text-green-700 flex items-center gap-2">
                      <Lock size={14} /> Secure
                    </div>
                    <div className="text-xs text-green-600">Auto-renews</div>
                  </div>

                  <button className="w-full py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                    View Certificate
                  </button>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: Configuration --- */}
            <div className="space-y-6">
              {/* Site Controls */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Site Controls</h2>

                <div className="space-y-5">
                  <ControlSwitch
                    label="Maintenance Mode"
                    description="Show 'Under Construction' page"
                    active={config.maintenance_mode}
                    onClick={() => toggleSetting("maintenance_mode")}
                  />
                  <ControlSwitch
                    label="Force HTTPS"
                    description="Redirect all traffic to secure"
                    active={config.ssl_enabled}
                    onClick={() => toggleSetting("ssl_enabled")}
                  />
                  <ControlSwitch
                    label="Server Caching"
                    description="Nginx FastCGI Cache"
                    active={config.caching_enabled}
                    onClick={() => toggleSetting("caching_enabled")}
                  />
                </div>
              </div>

              {/* Tech Stack Info */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Environment</h2>
                <div className="space-y-3">
                  <TechRow
                    label="PHP Version"
                    value={`v${config.php_version}`}
                  />
                  <TechRow label="Web Server" value="Nginx" />
                  <TechRow label="OS" value="Ubuntu 22.04" />
                  <TechRow label="Region" value="Frankfurt (EU)" />
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

function StatCard({ label, value, sub, color, icon }: any) {
  const colors: any = {
    green: "text-green-500 bg-green-50",
    red: "text-red-500 bg-red-50",
    blue: "text-blue-500 bg-blue-50",
    orange: "text-orange-500 bg-orange-50",
    purple: "text-purple-500 bg-purple-50",
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">
          {label}
        </div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        {sub && (
          <div className="text-[10px] text-gray-400 font-medium">{sub}</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
        <CheckCircle2 size={12} /> Live
      </span>
    );
  }
  if (status === "building") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
        <RefreshCw size={12} className="animate-spin" /> Building
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
      <XCircle size={12} /> Failed
    </span>
  );
}

function ControlSwitch({ label, description, active, onClick }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-bold text-gray-800 text-sm">{label}</div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
      <button
        onClick={onClick}
        className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${
          active ? "bg-black" : "bg-gray-200"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function TechRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}
