"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { Terminal, LogOut, ShieldAlert, ShieldCheck, ChevronRight, RefreshCw, Key } from "lucide-react";

export default function PortalPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const handleContinue = () => {
    router.push("/portal/dashboard");
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ redirectUrl: "/" });
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080810]" style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}>
        <RefreshCw size={24} className="animate-spin text-[#7b8cde]" />
      </div>
    );
  }

  return (
    <main 
      className="relative min-h-screen w-full flex items-center justify-center bg-[#080810] text-[#dde1f0] p-6 overflow-hidden" 
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7b8cde]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Panel */}
        <div className="bg-[#0c0c16] border border-[#151522] rounded-2xl shadow-2xl overflow-hidden relative">
          
          {/* Top Bar / Header */}
          <div className="bg-[#080810]/80 border-b border-[#151522] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#0a0a14] border border-[#1a1a28] rounded-md text-[#555]">
                <Terminal size={14} />
              </div>
              <span className="text-xs font-bold tracking-widest text-[#7b8cde] uppercase">
                STRCT // Auth_Portal
              </span>
            </div>
            
            {/* Status Pill */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] uppercase tracking-widest font-bold ${
              isSignedIn
                ? "bg-[#0a1a0a] border-[#1a4a1a] text-[#4ade80]"
                : "bg-[#1a0a0a] border-[#4a1a1a] text-[#f87171]"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSignedIn ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171]"}`} />
              {isSignedIn ? "Authenticated" : "Unauthorized"}
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0a0c1a] border border-[#7b8cde]/30 text-[#7b8cde] rounded-xl mb-4 shadow-[0_0_20px_rgba(123,140,222,0.1)]">
                {isSignedIn ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              </div>
              <h1 className="text-xl font-bold mb-1">System Access</h1>
              <p className="text-[11px] text-[#555] uppercase tracking-widest leading-relaxed">
                Provide credentials to access your centralized control node.
              </p>
            </div>

            {isSignedIn && user ? (
              <div className="space-y-6">
                
                {/* User Profile Block */}
                <div className="bg-[#0a0a14] border border-[#1a1a28] rounded-xl p-4 flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#2a2a3a]">
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] text-[#444] uppercase tracking-widest mb-0.5">Active Session</span>
                    <span className="truncate text-sm font-bold text-[#dde1f0]">
                      {user.fullName || user.username || "System Admin"}
                    </span>
                    <span className="truncate text-xs text-[#7b8cde] mt-0.5">
                      {user.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-between bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] font-bold py-3.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(123,140,222,0.15)] hover:shadow-[0_0_25px_rgba(123,140,222,0.3)] group"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Terminal size={16} />
                      <span>Initialize Dashboard</span>
                    </div>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#1a1a28] hover:border-[#2a2a3a] hover:bg-[#11111a] text-[#555] hover:text-[#f87171] font-bold py-3 px-5 rounded-xl transition-colors text-xs uppercase tracking-widest"
                  >
                    <LogOut size={14} />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#111115] border border-[#1a1a22] rounded-lg p-4 mb-6">
                  <p className="text-[11px] text-[#666] font-mono leading-relaxed">
                    <span className="text-[#7b8cde]">$ auth_request</span> --provider google
                    <br />
                    <span className="text-[#444]">&gt; Awaiting OAuth callback...</span>
                  </p>
                </div>

                <SignInButton mode="modal">
                  <button className="w-full flex items-center justify-center gap-3 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#7b8cde]/50 hover:bg-[#0c0c16] text-[#dde1f0] font-bold py-3.5 px-5 rounded-xl transition-all shadow-sm">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm">Authenticate via Google</span>
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-[#333] flex items-center justify-center gap-1.5 uppercase tracking-widest">
            <Key size={10} />
            Secure End-to-End Encrypted Tunnel
          </p>
        </div>
      </div>
    </main>
  );
}