
import { Check, Cpu, HardDrive, Network } from "lucide-react";

export default function SpecsPage() {
  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-syno-dark mb-6">
          Hardware Specifications
        </h1>
        <p className="text-xl text-gray-500">
          Designed for performance, reliability, and silence.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-syno-gray p-8 rounded-3xl">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-syno-dark mb-6 shadow-sm">
            <Cpu />
          </div>
          <h3 className="text-2xl font-bold mb-2">Processor</h3>
          <p className="text-gray-600 mb-4">Realtek RTD1619B</p>
          <p className="text-sm text-gray-500">
            Quad-core 1.7 GHz specialized for media processing and AI tasks.
          </p>
        </div>

        <div className="bg-syno-gray p-8 rounded-3xl">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-syno-dark mb-6 shadow-sm">
            <HardDrive />
          </div>
          <h3 className="text-2xl font-bold mb-2">Capacity</h3>
          <p className="text-gray-600 mb-4">4 TB Built-in</p>
          <p className="text-sm text-gray-500">
            Enough space for over 1 million photos or 1,500 hours of HD video.
          </p>
        </div>

        <div className="bg-syno-gray p-8 rounded-3xl">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-syno-dark mb-6 shadow-sm">
            <Network />
          </div>
          <h3 className="text-2xl font-bold mb-2">Connectivity</h3>
          <p className="text-gray-600 mb-4">1GbE LAN Port</p>
          <p className="text-sm text-gray-500">
            Gigabit Ethernet ensures fast local file transfers and backup
            speeds.
          </p>
        </div>

        <div className="bg-syno-gray p-8 rounded-3xl">
          <h3 className="text-2xl font-bold mb-6">External Ports</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">USB-A 3.2 Gen 1</span>
              <span className="font-semibold">x 1</span>
            </li>
            <li className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">USB-C 3.2 Gen 1</span>
              <span className="font-semibold">x 1</span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Connect external drives for backup or easy import.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-8 border-b pb-4">
          Software Features
        </h2>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="min-w-[200px] font-semibold text-syno-dark">
              File Access
            </div>
            <div className="text-gray-600">
              SMB Service, BeeStation Desktop, Mobile App, Web Portal
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="min-w-[200px] font-semibold text-syno-dark">
              AI Capabilities
            </div>
            <div className="text-gray-600">
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <Check size={18} className="text-syno-orange" /> Face
                  Recognition
                </li>
                <li className="flex gap-2">
                  <Check size={18} className="text-syno-orange" /> Object
                  Recognition
                </li>
                <li className="flex gap-2">
                  <Check size={18} className="text-syno-orange" /> Scene
                  Detection
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="min-w-[200px] font-semibold text-syno-dark">
              Compatibility
            </div>
            <div className="text-gray-600">
              iOS 15+, Android 8+, Windows 10/11, macOS 12.3+
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
