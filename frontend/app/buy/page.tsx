"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Check,
  Truck,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Minus,
  Plus,
  Star,
} from "lucide-react";

const productImages = [
  "/images/bee-front.jpg",
  "/images/bee-angle.jpg",
  "/images/bee-back.jpg",
  "/images/bee-lifestyle.jpg",
];

const specs = [
  { label: "Capacity", value: "4TB" },
  { label: "Processor", value: "Realtek RTD1619B" },
  { label: "Memory", value: "1GB DDR4" },
  { label: "Interface", value: "1x 1GbE LAN" },
];

export default function BuyPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const renderImagePlaceholder = (index: number) => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
      <span className="text-9xl font-bold opacity-10">{index + 1}</span>
    </div>
  );

  const handleAddToCart = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7">
            <div className="sticky top-32 space-y-6">
              <div className="aspect-[4/3] w-full bg-[#F9FAFB] rounded-[2rem] overflow-hidden relative border border-gray-100 shadow-sm">
                
                {renderImagePlaceholder(selectedImage)}

                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-[#FBC02D] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Best Seller
                  </span>
                  <span className="bg-white/90 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                    In Stock
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-2xl border-2 transition-all duration-200 overflow-hidden bg-gray-50 ${
                      selectedImage === idx
                        ? "border-[#FBC02D] ring-2 ring-[#FBC02D]/20"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl font-bold opacity-30">
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="mb-6 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-[#FBC02D]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium hover:underline cursor-pointer">
                  (142 Reviews)
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                Strct BeeStation
              </h1>
              <p className="text-gray-500 text-lg">
                Your personal cloud journey starts here.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  $219.99
                </span>
                <span className="text-gray-400 line-through text-lg">
                  $249.99
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Pay in 4 interest-free payments of $55.00.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-3 block">
                  Capacity
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative border-2 border-[#FBC02D] bg-[#FFFDF5] p-4 rounded-xl cursor-pointer">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">4TB</span>
                      <Check
                        size={16}
                        className="text-[#FBC02D]"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      Standard Model
                    </span>
                  </div>
                  <div className="relative border border-gray-200 p-4 rounded-xl opacity-50 cursor-not-allowed grayscale">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">8TB</span>
                      <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                        Soon
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Pro Model</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {specs.map((s, i) => (
                    <div key={i}>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
                        {s.label}
                      </dt>
                      <dd className="text-sm font-bold text-gray-900">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4 bg-white sticky bottom-0 lg:static pb-6 lg:pb-0 z-10 border-t lg:border-t-0 border-gray-100 pt-6 lg:pt-0">
              <div className="flex gap-4">
                <div className="flex items-center border border-gray-300 rounded-full px-4 h-14 w-32 justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 hover:text-black disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-500 hover:text-black"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-[#FBC02D]/20 ${
                    isAnimating
                      ? "bg-green-600 text-white scale-95"
                      : "bg-[#FBC02D] text-gray-900 hover:bg-[#f9a825] hover:-translate-y-1"
                  }`}
                >
                  {isAnimating ? (
                    <>
                      Added <Check size={20} />
                    </>
                  ) : (
                    <>
                      Add to Cart <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-500 pt-4">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-gray-900" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gray-900" />
                  3-Year Warranty
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-gray-900" />
                  30-Day Returns
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 border-t border-gray-200 pt-24">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            What&apos;s in the box
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Strct BeeStation", icon: "📦" },
              { name: "AC Power Adapter", icon: "🔌" },
              { name: "RJ-45 Ethernet Cable", icon: "🕸️" },
              { name: "Quick Start Guide", icon: "📄" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:bg-[#FFFDF5] group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
