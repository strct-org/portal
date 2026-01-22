"use client";
import FAQ from "@/components/sections/faq";
import Features from "@/components/sections/features";
import ProductSelector from "@/components/sections/product_selector";
import { Cloud, Lock, Zap, Smartphone, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="pt-16">
      <section className="relative bg-[#fafafa] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-40 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#FFF0D4] text-[#B87500] text-xs font-bold tracking-wide mb-8">
            NEW ARRIVAL
          </span>

          <h1 className="text-5xl md:text-7xl font-bold text-syno-dark tracking-tight mb-8 leading-[1.1]">
            Create your own <br className="hidden md:block" /> personal cloud.
          </h1>

          <p className="text-xl md:text-2xl text-syno-medium max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
            All your photos, files, and backups in one place. No subscription
            fees. 100% data ownership.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-syno-orange text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-syno-hoverOrange transition-all shadow-lg shadow-orange-100">
              Buy BeeStation
            </button>
            <button className="bg-white text-syno-dark border border-gray-300 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors">
              Watch the Video
            </button>
          </div>

          <div className="mt-20 relative mx-auto w-full max-w-5xl">
            <div className="aspect-[16/9] bg-gradient-to-b from-white to-gray-50 rounded-t-3xl border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 font-medium mb-2">
                  [Product Image Here]
                </p>
                <p className="text-sm text-gray-300">
                  bee.synology.com/hero.png
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-blue-50 text-[#007AFF] rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cloud size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-syno-dark">
              Cloud-like Experience
            </h3>
            <p className="text-syno-medium text-lg leading-relaxed">
              Access files from anywhere, just like popular cloud services, but
              the data lives in your home.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-orange-50 text-syno-orange rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-syno-dark">
              AI-Powered Photos
            </h3>
            <p className="text-syno-medium text-lg leading-relaxed">
              Built-in NPU for lightning fast object and face recognition to
              organize your memories automatically.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-green-50 text-[#34C759] rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-syno-dark">
              Privacy First
            </h3>
            <p className="text-syno-medium text-lg leading-relaxed">
              Your data never leaves your device for AI processing. You own your
              data completely.
            </p>
          </div>
        </div>
      </section>
      <Features />

      <ProductSelector />

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-syno-dark mb-8 leading-tight">
              Backup photos from your phone automatically.
            </h2>
            <p className="text-xl text-syno-medium mb-10 leading-relaxed">
              Never worry about running out of phone storage again. BeeStation
              backs up your camera roll as soon as you walk in the door over
              Wi-Fi.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-syno-dark font-medium text-lg">
                <Smartphone className="text-syno-orange" /> iOS and Android
                compatible
              </li>
              <li className="flex items-center gap-4 text-syno-dark font-medium text-lg">
                <Zap className="text-syno-orange" /> Background backup enabled
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 relative h-[600px] w-full bg-[#F5F5F7] rounded-[2.5rem] flex items-center justify-center overflow-hidden">
            <div className="w-64 h-[500px] bg-white border-8 border-gray-900 rounded-[3rem] shadow-2xl flex items-center justify-center">
              <span className="text-gray-300 font-bold">App UI</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-20">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-syno-dark mb-8 leading-tight">
              Smarter organization with built-in AI.
            </h2>
            <p className="text-xl text-syno-medium mb-10 leading-relaxed">
              BeeStation's built-in AI recognizes faces and objects, creating
              albums for people, pets, and scenes automatically. Find that
              specific photo of your cat in seconds.
            </p>
            <button className="group flex items-center gap-2 text-syno-orange font-bold text-xl hover:text-syno-hoverOrange transition-colors">
              Learn about AI features
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="md:w-1/2 relative h-[500px] w-full bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center p-8">
            <div className="grid grid-cols-3 gap-4 w-full h-full opacity-50">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-xl w-full h-full"
                ></div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/90 px-6 py-3 rounded-full font-bold text-syno-dark shadow-sm backdrop-blur-sm">
                AI Gallery View
              </span>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="py-32 bg-[#1D1D1F] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to start your journey?
          </h2>
          <p className="text-gray-400 text-xl mb-12">
            Get 4TB of storage, AI features, and peace of mind today.
          </p>
          <button className="bg-syno-orange text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-syno-hoverOrange transition-colors">
            Buy Now
          </button>
        </div>
      </section>
    </main>
  );
}
