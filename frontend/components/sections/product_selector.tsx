import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function ProductSelector() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find your ideal solution
          </h2>
          <p className="text-gray-500">
            Choose the backup style that fits your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="group bg-white rounded-[2.5rem] p-10 border border-gray-200 hover:border-[#FBC02D] transition-colors duration-300 relative overflow-hidden flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Strct Drive</h3>
              <p className="text-gray-500 mt-2">
                For individuals who need speed.
              </p>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {[
                "Computer backup (USB)",
                "High-speed transfer (10Gbps)",
                "Portable & Pocket-sized",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="#"
              className="w-full py-4 rounded-xl border border-gray-200 font-semibold text-center hover:bg-gray-50 transition-colors"
            >
              Explore BeeDrive
            </Link>
          </div>

          <div className="group bg-[#2D3748] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col transform md:-translate-y-4">
            <div className="absolute top-6 right-6 px-4 py-1 bg-[#FBC02D] rounded-full text-xs font-bold text-black uppercase tracking-wider">
              Most Popular
            </div>

            <div className="mb-8 relative z-10">
              <h3 className="text-2xl font-bold text-white">Strct Station</h3>
              <p className="text-gray-400 mt-2">
                For families and personal cloud.
              </p>
            </div>

            <ul className="space-y-4 mb-10 flex-grow relative z-10">
              {[
                "Cloud access anywhere",
                "Multi-user support",
                "Auto-photo backup (WiFi)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-gray-200"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[#FBC02D]">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="#"
              className="relative z-10 w-full py-4 rounded-xl bg-[#FBC02D] font-bold text-black text-center hover:bg-[#F9A825] transition-colors flex items-center justify-center gap-2"
            >
              Buy BeeStation <ArrowRight size={18} />
            </Link>

            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
