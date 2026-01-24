"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Settings, 
  MoreVertical, 
  HardDrive, 
  CheckCircle, 
  Search,
  ArrowLeft,
  Share2,
  FileText,
  Image as ImageIcon,
  Users,
  X,
  Send,
  Cloud,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data ---
const DEVICES = [
  {
    id: 1,
    name: "Living Room Bee",
    status: "online",
    ip: "192.168.1.45",
    usage: 45, // percent
    total: "4TB",
    type: "station"
  },
  {
    id: 2,
    name: "Studio Backup",
    status: "offline",
    ip: "192.168.1.12",
    usage: 12,
    total: "2TB",
    type: "drive"
  }
];

const FRIENDS = [
  { id: 1, name: "Sarah Miller", email: "sarah.m@design.co", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "David Chen", email: "d.chen@arch.studio", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Alex Ross", email: "aross@photo.net", avatar: "https://i.pravatar.cc/150?u=3" },
];

export default function DashboardPage() {
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

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
              onSelectDevice={setSelectedDevice} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// VIEW 1: THE DASHBOARD (Device List)
// ----------------------------------------------------------------------------
function DashboardView({ onSelectDevice }: { onSelectDevice: (d: any) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-2">My Cloud</h1>
          <p className="text-gray-500 font-medium">Overview of your connected personal servers.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1d1d1f] text-white px-5 py-2.5 rounded-full font-semibold shadow-lg hover:bg-black hover:scale-105 transition-all">
          <Plus size={18} /> Add New Bee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DEVICES.map((device) => (
          <div 
            key={device.id}
            onClick={() => onSelectDevice(device)}
            className={`group relative bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50 hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer overflow-hidden ${device.status === 'offline' ? 'grayscale opacity-80' : ''}`}
          >
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-300'}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{device.status}</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <HardDrive size={32} className="text-[#1d1d1f]" />
            </div>

            <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">{device.name}</h3>
            <p className="text-sm text-gray-500 mb-8">{device.ip}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-600">Storage Used</span>
                <span className="text-[#1d1d1f]">{device.usage}% of {device.total}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffc233] rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${device.usage}%` }}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center text-sm font-bold text-[#ffc233] opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
              Manage Device <ChevronRight size={16} />
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-gray-300 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-[#ffc233] hover:bg-[#fffcf0] transition-all cursor-pointer min-h-[300px] group">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400 group-hover:text-[#ffc233] group-hover:scale-110 transition-all">
            <Plus size={28} />
          </div>
          <h3 className="font-bold text-gray-900">Pair New Device</h3>
          <p className="text-sm text-gray-400 mt-2 px-4 max-w-[200px]">
            Have a new BeeStation? Click to start setup.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function DeviceDetailView({ device, onBack }: { device: any, onBack: () => void }) {
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

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#fffcf0] to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200">
                <HardDrive className="text-[#ffc233]" size={36} />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-[#1d1d1f]">{device.name}</h1>
               <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Online • {device.total} Capacity
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Storage Breakdown</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><ImageIcon size={18} /></div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-700">Photos</div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1 overflow-hidden"><div className="w-[60%] h-full bg-blue-500 rounded-full"></div></div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><FileText size={18} /></div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-700">Documents</div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1 overflow-hidden"><div className="w-[30%] h-full bg-purple-500 rounded-full"></div></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Recent Files</h3>
                <button className="text-sm font-bold text-[#ffc233] hover:underline">View All</button>
             </div>
             
             <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                 <Cloud size={48} className="text-gray-300 mb-4" />
                 <p className="text-gray-900 font-bold">No recent activity</p>
                 <p className="text-sm text-gray-500 max-w-xs mt-1">Start uploading files or invite friends to collaborate on this BeeStation.</p>
                 <button className="mt-6 text-sm font-bold text-blue-600 hover:underline">Upload Files</button>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal onClose={() => setShareModalOpen(false)} deviceName={device.name} />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
function ShareModal({ onClose, deviceName }: { onClose: () => void, deviceName: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [step, setStep] = useState(1); 

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
            <h3 className="text-xl font-bold text-[#1d1d1f]">Share {deviceName}</h3>
            <p className="text-sm text-gray-500">Invite friends to access files.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-black hover:shadow-md transition-all"><X size={18} /></button>
        </div>

        <div className="p-8">
           
           <div className="relative mb-8">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Find User</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Suggested Contacts</label>
              
              <div className="space-y-2">
                {FRIENDS.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((friend) => (
                  <div key={friend.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                     <div className="flex items-center gap-3">
                        <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                        <div>
                           <div className="font-bold text-sm text-[#1d1d1f]">{friend.name}</div>
                           <div className="text-xs text-gray-500">{friend.email}</div>
                        </div>
                     </div>
                     <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 group-hover:bg-[#ffc233] group-hover:border-[#ffc233] group-hover:text-black transition-colors">
                        Select
                     </button>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
           <button className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg">
             <Send size={16} /> Send Invitation
           </button>
        </div>

      </motion.div>
    </div>
  );
}