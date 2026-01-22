"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hexagon } from "lucide-react"; 

export default function PortalPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/portal/dashboard");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-sans text-gray-900">
     
      <div className="absolute inset-0 -z-10 h-full w-full">
        <Image
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=3000&auto=format&fit=crop"
          alt="BeeStation Background"
          fill
          priority
          className="object-cover object-center"
          quality={100}
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 lg:flex-row lg:justify-end lg:pr-[15%]">
        <div className="w-full max-w-[400px] rounded-[32px] bg-white/85 p-10 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-3xl sm:p-12">
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center text-black">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-16 w-16 text-black"
              >
                <path d="M12 2L2 7l0 10l10 5l10-5l0-10z" />
              </svg>
              <span className="absolute text-2xl font-bold text-white mb-1 mr-0.5">
                <span className="italic">b</span>.
              </span>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">BeeStation</h1>
          <p className="mb-10 text-gray-600">Your personal cloud journey.</p>

          <button
            onClick={handleContinue}
            className="group mb-6 flex w-full items-center gap-4 rounded-xl bg-gray-100/80 p-4 text-left transition-colors hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D3748] text-sm font-bold text-white">
              M
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-gray-900 group-hover:text-black">
                Martin Kovachki
              </span>
              <span className="truncate text-xs text-gray-500">
                martbul01@gmail.com
              </span>
            </div>
          </button>

          <div className="text-xs text-gray-500 leading-relaxed">
            Continue with this Synology Account or <br />
            <Link
              href="/portal/login"
              className="underline decoration-gray-400 underline-offset-2 hover:text-gray-800"
            >
              sign in to another
            </Link>
            .
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 w-full text-center">
        <div className="flex flex-wrap justify-center gap-4 px-6 text-[10px] text-white/90 drop-shadow-md sm:text-xs">
          <span>Copyright © 2026 Synology Inc. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:underline">
            Terms and Conditions
          </Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:underline">
            Privacy Statement
          </Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:underline">
            Cookie Preference
          </Link>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-1 cursor-pointer hover:underline">
            <GlobeIcon className="h-3 w-3" />
            <span>Login site - Global</span>
          </div>
        </div>
      </footer>
    </main>
  );
}


function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
