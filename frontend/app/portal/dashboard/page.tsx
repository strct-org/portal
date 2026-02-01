"use client";

import { useState } from "react";
import {
  Plus,
  Settings,
  HardDrive,
  Search,
  ArrowLeft,
  Share2,
  X,
  Send,
  ChevronRight,
  Check,
  Loader2,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { apiService } from "@/api";
import { usePortal } from "@/providers/PortalProvider";
import { useAuth } from "@clerk/nextjs";

const FRIENDS = [
  {
    id: 1,
    name: "Sarah Miller",
    email: "sarah.m@design.co",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "David Chen",
    email: "d.chen@arch.studio",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
];

export default function DashboardPage() {
  const { devices, addDeviceToState, isLoading } = usePortal();

  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f] selection:bg-[#ffc233] selection:text-black">
      <main className="pt-28 px-6 pb-12 max-w-[1200px] mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {selectedDevice ? (
            <DeviceDetailView
              key="detail"
              device={selectedDevice}
              onBack={() => setSelectedDevice(null)}
            />
          ) : (
            <DashboardView
              key="dashboard"
              devices={devices}
              isLoading={isLoading}
              onSelectDevice={setSelectedDevice}
              onAddDevice={() => setIsAddModalOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddDeviceModal
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={(newDevice) => {
              addDeviceToState(newDevice); // Optimistic Update
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
  isLoading,
  onSelectDevice,
  onAddDevice,
}: {
  devices: any[];
  isLoading: boolean;
  onSelectDevice: (d: any) => void;
  onAddDevice: () => void;
}) {
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

      {isLoading && devices.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {devices.map((device) => (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device)}
              className={`group relative bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50 hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer overflow-hidden ${
                // Use is_online from DB (boolean) or string check
                !device.is_online ? "grayscale opacity-80" : ""
              }`}
            >
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    device.is_online
                      ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                      : "bg-gray-300"
                  }`}
                ></span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {device.is_online ? "Online" : "Offline"}
                </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <HardDrive size={32} className="text-[#1d1d1f]" />
              </div>

              <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
                {device.friendly_name || device.id}
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                {device.local_ip || "Connecting..."}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600">Storage Used</span>
                  {/* Mock usage data since DB might not have it yet */}
                  <span className="text-[#1d1d1f]">45% of 1TB</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffc233] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `45%` }}
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center text-sm font-bold text-[#ffc233] opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                Manage Device <ChevronRight size={16} />
              </div>
            </div>
          ))}

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

// ----------------------------------------------------------------------------
// VIEW 2: DEVICE DETAILS (Kept mostly the same)
// ----------------------------------------------------------------------------
function DeviceDetailView({
  device,
  onBack,
}: {
  device: any;
  onBack: () => void;
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
      >
        <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
          <ArrowLeft size={14} />
        </div>
        Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#fffcf0] to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200">
              <HardDrive className="text-[#ffc233]" size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f]">
                {device.friendly_name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    device.is_online ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></span>
                <span className="capitalize">
                  {device.is_online ? "Online" : "Offline"}
                </span>{" "}
                • 1TB Capacity
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1d1d1f] font-bold transition-colors">
              <Settings size={18} /> Settings
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ffc233] hover:bg-[#ffcd57] text-[#1d1d1f] font-bold shadow-lg shadow-orange-100 transition-all hover:scale-105"
            >
              <Share2 size={18} /> Share Files
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl text-center text-gray-500">
        File Browser placeholder for {device.friendly_name}
      </div>

      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal
            onClose={() => setShareModalOpen(false)}
            deviceName={device.friendly_name}
          />
        )}
      </AnimatePresence>
    </motion.div>
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
            <p className="text-gray-500">
              Checking device availability and establishing secure link.
            </p>
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

function ShareModal({
  onClose,
  deviceName,
}: {
  onClose: () => void;
  deviceName: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selectedFriend) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(onClose, 1500); // Close after showing success
    }, 1500);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Invitation Sent!</h3>
          <p className="text-gray-500 mt-2">
            They will receive an email shortly.
          </p>
        </motion.div>
      </div>
    );
  }

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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              Share {deviceName}
            </h3>
            <p className="text-sm text-gray-500">
              Invite friends to access files.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full text-gray-400 hover:text-black hover:shadow-md transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8">
          <div className="relative mb-8">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Find User
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter email, username or device ID"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc233] focus:bg-white transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Suggested Contacts
            </label>

            <div className="space-y-2">
              {FRIENDS.filter((f) =>
                f.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedFriend === friend.id
                      ? "bg-[#fffcf0] border-[#ffc233] ring-1 ring-[#ffc233]"
                      : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#1d1d1f]">
                        {friend.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {friend.email}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedFriend === friend.id
                        ? "border-[#ffc233] bg-[#ffc233]"
                        : "border-gray-200"
                    }`}
                  >
                    {selectedFriend === friend.id && (
                      <Check size={14} className="text-black" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedFriend || isSending}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg ${
              !selectedFriend
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[#1d1d1f] text-white hover:bg-black"
            }`}
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isSending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
