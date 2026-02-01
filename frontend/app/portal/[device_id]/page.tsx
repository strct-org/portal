"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  HardDrive,
  Search,
  ArrowLeft,
  Share2,
  X,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";

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

export default function DevicePage() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading } = usePortal();
  const [shareModalOpen, setShareModalOpen] = useState(false);


  const deviceId = params.device_id as string;
  const device = devices?.find((d) => d?.id === deviceId);

  if (isLoading || !devices) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center text-[#1d1d1f]">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <HardDrive className="text-gray-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Device Not Found</h1>
        <p className="text-gray-500 mb-6">
          The device you are looking for does not exist or you do not have
          permission.
        </p>
        <button
          onClick={() => router.push("/portal/dashboard")}
          className="flex items-center gap-2 px-6 py-3 bg-[#1d1d1f] text-white rounded-full font-bold hover:bg-black transition-all"
        >
          <ArrowLeft size={18} /> Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f] selection:bg-[#ffc233] selection:text-black">
      <main className="pt-28 px-6 pb-12 max-w-[1200px] mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </button>

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
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    IP: {device.local_ip || "Unknown"}
                  </p>
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

          <div className="bg-white p-8 rounded-3xl text-center text-gray-500 min-h-[400px] flex items-center justify-center border border-gray-100 shadow-sm">
            <div>
              <p className="text-lg font-medium mb-2">File Browser</p>
              <p className="text-sm opacity-70">
                Connected to {device.friendly_name}
              </p>
            </div>
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
      </main>
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
      setTimeout(onClose, 1500);
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
