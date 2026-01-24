"use client";

import { useState, useEffect } from "react";
import FAQ from "@/components/sections/faq";
import Features from "@/components/sections/features";
import ProductSelector from "@/components/sections/product_selector";
import { 
  Cloud, 
  Lock, 
  Zap, 
  Smartphone, 
  ChevronRight, 
  HardDrive, 
  Share2,
  Play
} from "lucide-react";

export default function Home() {
  // Simple fade-in effect on load
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);

  return (
    <main className={`font-sans antialiased text-[#1d1d1f] bg-white transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 text-center z-10 relative">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
            <span className="text-[#bf7e2e] font-semibold text-sm tracking-wide uppercase">
              New Arrival
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
            Create your own <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d97c23] to-[#e89a4d]">
              personal cloud.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-[#86868b] max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight">
            Store photos, files, and backups in one place. <br className="hidden md:block"/>
            No subscription fees. 100% data ownership.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button className="bg-[#1d1d1f] text-white px-8 py-4 rounded-full font-medium text-[17px] hover:bg-[#333] hover:scale-105 transition-all duration-300 shadow-xl shadow-black/10 min-w-[180px]">
              Buy BeeStation
            </button>
            <button className="group flex items-center gap-2 text-[#2997ff] bg-[#f5f5f7] px-8 py-4 rounded-full font-medium text-[17px] hover:bg-[#e8e8ed] transition-colors min-w-[180px] justify-center">
              <Play size={18} fill="currentColor" />
              Watch the Video
            </button>
          </div>

          {/* Hero Image / Abstract Representation */}
          <div className="relative mx-auto w-full max-w-4xl">
            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-200/30 blur-[100px] rounded-full -z-10"></div>
            
            <div className="aspect-[16/10] bg-[#fbfbfd] rounded-[2.5rem] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer">
              {/* Abstract Device CSS Representation */}
              <div className="w-48 h-64 bg-[#1d1d1f] rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-700 flex flex-col items-center pt-8">
                 <div className="w-12 h-1 bg-gray-700 rounded-full mb-2"></div>
                 <div className="w-32 h-32 rounded-full border border-gray-700/50 mt-10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-pulse"></div>
                 </div>
              </div>
              <div className="absolute bottom-10 text-gray-400 font-medium text-sm tracking-wide">
                BeeStation Model BS1
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID VALUE PROPS --- */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#f5f5f7] p-10 rounded-[32px] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#0071e3]">
                  <Cloud size={28} strokeWidth={2} />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Cloud-like Experience</h3>
                <p className="text-[#86868b] text-lg font-medium leading-relaxed">
                  Access files from anywhere via web or app. It feels just like the cloud, but you hold the keys.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f5f5f7] p-10 rounded-[32px] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#bf7e2e]">
                  <Zap size={28} strokeWidth={2} />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">AI-Powered Photos</h3>
                <p className="text-[#86868b] text-lg font-medium leading-relaxed">
                  Built-in NPU automatically organizes your memories by people, pets, and objects.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f5f5f7] p-10 rounded-[32px] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-[#34c759]">
                  <Lock size={28} strokeWidth={2} />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Privacy First</h3>
                <p className="text-[#86868b] text-lg font-medium leading-relaxed">
                  Data processing happens locally. Your personal files never leave your device for AI analysis.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- ZIG ZAG FEATURE SECTIONS --- */}
      
      {/* Feature 1: Mobile Backup */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-[#1d1d1f] rounded-[40px] p-8 md:p-20 text-white overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
              <div className="md:w-1/2">
                <span className="text-orange-400 font-bold tracking-wider text-xs uppercase mb-4 block">Seamless Integration</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                  Backup photos <br/>automatically.
                </h2>
                <p className="text-gray-400 text-xl mb-8 leading-relaxed font-medium">
                  Free up space on your phone immediately. BeeStation backs up your camera roll as soon as you walk in the door.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white font-medium text-lg border-b border-gray-800 pb-4">
                    <Smartphone className="text-orange-400" /> 
                    <span>iOS and Android compatible</span>
                  </div>
                  <div className="flex items-center gap-4 text-white font-medium text-lg">
                    <Zap className="text-orange-400" /> 
                    <span>Background backup enabled</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                 {/* CSS Phone Mockup */}
                 <div className="w-[300px] h-[600px] border-[14px] border-[#383838] bg-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 w-full h-8 bg-[#383838] rounded-b-xl z-20"></div>
                    <div className="w-full h-full bg-gray-100 flex flex-col p-4">
                      <div className="w-full h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square bg-orange-100 rounded-lg"></div>
                        <div className="aspect-square bg-blue-100 rounded-lg"></div>
                        <div className="aspect-square bg-green-100 rounded-lg"></div>
                        <div className="aspect-square bg-purple-100 rounded-lg"></div>
                      </div>
                      <div className="mt-auto bg-green-500 text-white text-center py-3 rounded-xl font-bold text-sm">
                        Backup Complete
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: AI Organization */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row-reverse items-center gap-20">
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-6 leading-tight tracking-tight">
                Smarter organization with built-in AI.
              </h2>
              <p className="text-xl text-[#86868b] mb-8 leading-relaxed font-medium">
                BeeStation's built-in AI recognizes faces and objects, creating albums for people, pets, and scenes automatically. 
              </p>
              <button className="group flex items-center gap-2 text-[#bf7e2e] font-semibold text-xl hover:underline underline-offset-4">
                Explore AI Features
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="aspect-square rounded-[3rem] bg-[#f5f5f7] overflow-hidden p-8 grid grid-cols-2 gap-4">
                 {/* Abstract Photo Grid */}
                 <div className="bg-white rounded-3xl shadow-sm p-4 flex flex-col items-center justify-center transform hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-16 h-16 bg-blue-100 rounded-full mb-3"></div>
                    <span className="font-bold text-gray-800">People</span>
                 </div>
                 <div className="bg-white rounded-3xl shadow-sm p-4 flex flex-col items-center justify-center transform hover:-translate-y-2 transition-transform duration-500 delay-100">
                    <div className="w-16 h-16 bg-orange-100 rounded-full mb-3"></div>
                    <span className="font-bold text-gray-800">Pets</span>
                 </div>
                 <div className="bg-white rounded-3xl shadow-sm p-4 col-span-2 flex items-center gap-6 transform hover:-translate-y-2 transition-transform duration-500 delay-200">
                    <div className="w-16 h-16 bg-green-100 rounded-xl"></div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">Places</span>
                      <span className="text-sm text-gray-400">1,204 Photos</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- IMPORTED SECTIONS --- */}
      {/* We assume these components exist as per your request, wrapping them to ensure style consistency */}
      <div className="bg-[#fbfbfd]">
        <Features />
        <ProductSelector />
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-24">
        <h2 className="text-center text-4xl font-bold mb-16 tracking-tight">Frequently Asked Questions</h2>
        <FAQ />
      </div>

      {/* --- FOOTER CTA --- */}
      <section className="py-40 bg-[#1d1d1f] text-white text-center relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#2c2c2e] to-transparent rounded-full opacity-50 -mt-64 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
            Ready to start your journey?
          </h2>
          <p className="text-gray-400 text-xl md:text-2xl mb-12 font-medium max-w-2xl mx-auto">
            Get 4TB of storage, intelligent AI features, and total peace of mind today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-[#bf7e2e] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#d98f3b] transition-colors shadow-lg shadow-orange-900/20">
              Buy Now
            </button>
            <button className="text-white border border-gray-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              Find a Reseller
            </button>
          </div>
          <p className="mt-10 text-sm text-gray-600">
            *Storage capacity is subject to formatting and system files.
          </p>
        </div>
      </section>

    </main>
  );
}