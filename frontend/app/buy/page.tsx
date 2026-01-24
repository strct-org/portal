"use client";

import React, { useState } from "react";
import {
  Check,
  Truck,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Star,
  Cpu,
  HardDrive,
  Wifi,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Mock data with distinct visual styles for the slider
const productImages = [
  { id: 0, label: "Front View", color: "from-[#f5f5f7] to-[#e8e8ed]", icon: "🖥️" },
  { id: 1, label: "Side Profile", color: "from-[#eef2f3] to-[#8e9eab]", icon: "📐" },
  { id: 2, label: "Rear Ports", color: "from-[#E0EAFC] to-[#CFDEF3]", icon: "🔌" },
  { id: 3, label: "Lifestyle", color: "from-[#fff1eb] to-[#ace0f9]", icon: "🏡" },
];

const specs = [
  { label: "Processor", value: "Realtek RTD1619B", icon: Cpu },
  { label: "Memory", value: "1GB DDR4", icon: HardDrive },
  { label: "Connectivity", value: "1GbE LAN", icon: Wifi },
];

export default function BuyPage() {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextSlide = () => setSelectedImage((prev) => (prev + 1) % productImages.length);
  const prevSlide = () => setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-[#fbfbfd] font-sans text-[#1d1d1f] selection:bg-[#ffc233] selection:text-black">
      
      <nav className="h-16 w-full bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/50 flex items-center px-6 lg:px-12 justify-between">
         <span className="font-bold text-xl tracking-tight">Synology</span>
         <div className="text-sm font-medium text-gray-500">BeeStation Series</div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-8">
              
              <div className="aspect-[4/3] w-full bg-white rounded-[2.5rem] relative shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden group">
                
                <div 
                  className="w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ transform: `translateX(-${selectedImage * 100}%)` }}
                >
                  {productImages.map((img, index) => (
                    <div key={img.id} className="w-full h-full flex-shrink-0 relative bg-white">
                        <div className={`absolute inset-0 bg-gradient-to-br ${img.color} flex items-center justify-center`}>
                            <div className="relative z-10 text-center transform scale-90 sm:scale-100">
                                <div className="w-64 h-80 bg-gradient-to-l from-[#2a2a2c] to-[#1c1c1e] rounded-xl shadow-2xl mx-auto flex flex-col items-center justify-end pb-8 relative border-r border-white/10">
                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
                                    
                                    <div className="text-6xl mb-4 opacity-80">{img.icon}</div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                                </div>
                                <div className="w-64 h-8 bg-black/20 blur-xl rounded-[100%] mx-auto mt-[-20px]"></div>
                            </div>
                        </div>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button onClick={prevSlide} className="w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center pointer-events-auto hover:scale-105 transition-transform text-gray-800">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextSlide} className="w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center pointer-events-auto hover:scale-105 transition-transform text-gray-800">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="absolute top-8 left-8">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1d1d1f] text-white text-xs font-bold tracking-wide shadow-md">
                    NEW RELEASE
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      selectedImage === idx
                        ? "w-12 bg-[#1d1d1f]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col pt-4">
            
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-[#ffc233]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" className="drop-shadow-sm" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-black transition-colors">
                  142 verified reviews
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-4">
                BeeStation
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                Create your own personal cloud in minutes. No subscription fees.
              </p>
            </div>

            <div className="mb-12 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-bold text-[#1d1d1f] tracking-tight">$219.99</span>
                    <span className="text-xl text-gray-400 line-through mb-1.5 font-medium">$249.00</span>
                </div>
                <div className="flex gap-2 mt-3">
                   <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">Save $30</span>
                   <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">Free 2-Day Shipping</span>
                </div>
                <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    Pay as low as <span className="font-semibold text-black">$55.00/mo</span> with <span className="font-bold">Affirm</span>.
                </p>
            </div>

            <div className="space-y-8 mb-12">
              
              <div>
                <div className="flex justify-between items-center mb-4">
                     <label className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">Capacity</label>
                     <a href="#" className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium">Size Guide</a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group cursor-pointer">
                    <input type="radio" name="capacity" className="peer sr-only" defaultChecked />
                    <div className="p-5 rounded-2xl border-2 border-[#1d1d1f] bg-[#fffcf5] transition-all duration-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#1d1d1f] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                            BEST VALUE
                        </div>
                        <div className="flex justify-between items-start mb-2 mt-1">
                            <span className="text-xl font-bold text-[#1d1d1f]">4TB</span>
                            <div className="w-6 h-6 rounded-full bg-[#1d1d1f] flex items-center justify-center">
                                <Check size={14} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Stores ~1,000,000 photos</p>
                    </div>
                  </div>

                  <div className="relative opacity-50 cursor-not-allowed grayscale">
                    <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-full">
                         <div className="flex justify-between items-start mb-2 mt-1">
                            <span className="text-xl font-bold text-gray-400">8TB</span>
                            <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded uppercase">Sold Out</span>
                        </div>
                         <p className="text-xs text-gray-400">Stores ~2,000,000 photos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                  <label className="text-sm font-bold text-[#1d1d1f] mb-4 block uppercase tracking-wider">Specifications</label>
                  <div className="grid grid-cols-3 gap-3">
                      {specs.map((spec, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                  <spec.icon size={20} className="text-gray-600" />
                              </div>
                              <div>
                                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">{spec.label}</div>
                                  <div className="text-xs font-bold text-[#1d1d1f]">{spec.value}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                
                <button
                    className="w-full h-16 rounded-full bg-[#ffc233] text-[#1d1d1f] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#ffcd57] hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                >
                    Buy BeeStation <ArrowRight size={20} />
                </button>

                <div className="flex items-center justify-center gap-x-8 gap-y-2 flex-wrap text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                        <Truck size={14} className="text-gray-900"/> Free Shipping
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-gray-900"/> 3-Year Warranty
                    </div>
                    <div className="flex items-center gap-2">
                        <RotateCcw size={14} className="text-gray-900"/> 30-Day Returns
                    </div>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}