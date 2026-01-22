// app/portal/dashboard/page.tsx
import React from "react";
import {
  Plus,
  Settings,
  MoreVertical,
  HardDrive,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBC02D] font-bold text-white">
            B
          </div>
          <span className="font-bold text-lg text-gray-800">
            BeeStation Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-300">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
            <p className="text-gray-500 text-sm">
              Manage your BeeStations and BeeDrives
            </p>
          </div>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" /> Add Device
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FBC02D]" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <HardDrive className="w-8 h-8 text-[#FBC02D]" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Living Room Bee
            </h3>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Online</span>
              <span className="text-xs text-gray-400">• 192.168.1.45</span>
            </div>

            <div className="flex gap-2 mt-auto">
              <Button variant="outline" className="flex-1 text-xs h-9">
                Files
              </Button>
              <Button variant="outline" className="flex-1 text-xs h-9">
                Photos
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer opacity-75 grayscale-[0.5]">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-100 rounded-xl">
                <HardDrive className="w-8 h-8 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Office Backup
            </h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-500">Offline</span>
            </div>

            <div className="flex gap-2 mt-auto">
              <Button variant="outline" disabled className="flex-1 text-xs h-9">
                Connect
              </Button>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[#FBC02D] hover:bg-yellow-50/10 transition-colors cursor-pointer min-h-[240px]">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-400 group-hover:text-[#FBC02D]">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900">Pair New Device</h3>
            <p className="text-sm text-gray-500 mt-2 px-4">
              Have a new BeeStation? Set it up here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
