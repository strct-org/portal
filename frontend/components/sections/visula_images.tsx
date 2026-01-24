"use client";

import { 
  Cloud, 
  HardDrive, 
  Users, 
  Monitor, 
  Lock, 
  Play, 
  RefreshCcw, 
  Usb, 
  ShieldCheck 
} from "lucide-react";
import Image from "next/image";

export function Visulas() {
  return (
    <section className="w-full">
      
      <div className="max-w-[1200px] mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-4 tracking-tight">
              Pick up where you left off
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're a designer, a photographer, or an office worker, you can open
              and edit BeeStation files from any desktop, expanding on your computer space
              while continuing your work.¹
            </p>
          </div>
          <div className="relative h-[300px] md:h-[400px] w-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 font-medium flex flex-col items-center gap-2">
                   <Monitor size={48} />
                   [Image: Laptop & Monitor Setup]
                </span>
            </div>
            <div className="absolute right-10 top-10 w-1/2 h-2/3 bg-green-600/10 border-2 border-green-500 rounded-lg transform rotate-2"></div>
            <div className="absolute left-10 bottom-10 w-1/2 h-2/3 bg-green-600/10 border-2 border-green-500 rounded-lg transform -rotate-2 z-10 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>

      <div className="bg-[#f9f9f9] py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-48 w-full flex items-center justify-center mb-6 relative">
              <div className="bg-[#eaeaea] w-32 h-32 rounded-full flex items-center justify-center relative">
                 <div className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-sm"><Users size={16}/></div>
                 <div className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-sm"><Users size={16}/></div>
                 <div className="bg-white p-4 rounded-full shadow-md z-10">
                    <Users size={32} className="text-gray-700"/>
                 </div>
                 <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-full opacity-50"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Personal spaces for family</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Grant your family members their own exclusive storage space, providing personalized data storage
              that's as unique as they are. These spaces are entirely separate to ensure privacy and control.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6">
            <div className="h-48 w-full flex items-center justify-center mb-6 relative">
               <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center z-20 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-0 left-10 bg-white p-2 rounded-full shadow-md"><Cloud className="text-blue-500" size={20}/></div>
                  <div className="absolute bottom-4 right-8 bg-white p-2 rounded-full shadow-md"><Usb className="text-gray-600" size={20}/></div>
                  <div className="absolute top-8 right-0 bg-white p-2 rounded-full shadow-md"><Image src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" alt="Drive" width={20} height={20} /></div>
               </div>
            </div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Gather your scattered files</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Protect your cloud service, BeeDrive, and external drive data through backups, providing peace of mind
              against unforeseen data loss situations like cloud account suspension or termination.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6">
            <div className="h-48 w-full flex items-center justify-center mb-6 relative">
              <div className="flex items-center gap-4 text-gray-400">
                <Cloud size={32} />
                <div className="flex flex-col items-center gap-1">
                    <RefreshCcw size={20} className="text-gray-400 animate-spin-slow" />
                    <div className="w-12 h-20 bg-[#555] rounded-md shadow-lg flex flex-col items-center justify-end pb-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
                <HardDrive size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Built-in data protection</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              BeeStation automatically creates internal restore points using snapshot technology, while its external
              backup include the options to an external drive, Synology NAS, or C2 Storage safeguard your data.²
            </p>
          </div>

        </div>
      </div>

      <div className="bg-[#f0efed] py-20 lg:py-12">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-3xl font-bold text-[#002855]">Acronis</h2>
              <span className="text-3xl font-light text-[#1d1d1f]">True Image</span>
            </div>
            
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">
              Full Computer Protection — Back up, Recover, Clone
            </h3>
            
            <div className="space-y-4 text-gray-600 text-sm mb-8 leading-relaxed">
              <p>
                Every BeeStation now includes a three-year license of <span className="underline decoration-1 underline-offset-2">Acronis True Image Essentials</span> (for one computer). Acronis True Image is trusted by over 5.5 million users worldwide.
              </p>
              <p>
                Back up and protect your entire computer including the operating system, applications, settings, and files, with built-in ransomware defense to keep your personal and important data safe.⁶
              </p>
            </div>

            <button className="flex items-center gap-2 bg-[#ffc233] text-[#1d1d1f] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#ecc04d] transition-colors">
              Watch Video
              <Play size={14} fill="currentColor" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden shadow-2xl h-[300px] md:h-[400px] bg-white">
             <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <ShieldCheck size={64} className="mx-auto mb-2 opacity-50"/>
                    <span className="text-sm font-medium">[Image: Laptop running Acronis next to BeeStation]</span>
                </div>
             </div>
          </div>

        </div>
      </div>

      <div className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1">
                <div className="mb-6">
                    <div className="w-12 h-12 bg-[#1d1d1f] rounded-xl flex items-center justify-center mb-4">
                        <Cloud className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-4">
                        Privacy-first cloud backup with BeeProtect
                    </h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-2">
                    Every BeeStation comes with 3 months of free cloud protection. Enjoy secure, encrypted cloud backups for all your files on BeeStation, without worrying about how much storage you might need down the line.³
                </p>
            </div>

            <div className="order-1 lg:order-2 relative rounded-xl overflow-hidden h-[300px] md:h-[500px] bg-gray-100">
                 <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                     <span className="text-gray-400 font-medium">[Image: Woman working at desk with iMac]</span>
                 </div>
            </div>

        </div>
      </div>

    </section>
  );
}