"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  Terminal, 
  ChevronRight,
} from "lucide-react";
import {  useUser } from "@clerk/nextjs";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b font-mono ${
          isScrolled
            ? "bg-[#080810]/95 backdrop-blur-md border-[#1a1a28] py-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]"
            : "bg-[#080810]/50 backdrop-blur-sm border-transparent py-6"
        }`}
        style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative w-8 h-8 bg-[#0a0a14] border border-[#1a1a28] rounded-lg flex items-center justify-center text-[#fbbf24] transition-all duration-300 group-hover:border-[#fbbf24]/50 group-hover:bg-[#fbbf24]/10 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <Terminal size={16} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm tracking-widest text-[#dde1f0] uppercase">
                Strct_
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {["Overview", "Specs", "Downloads"].map((item) => (
                <Link
                  key={item}
                  href={item === "Overview" ? "/" : `/${item.toLowerCase()}`}
                  className="group relative text-xs font-bold text-[#555] uppercase tracking-widest hover:text-[#dde1f0] transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[#7b8cde] transition-opacity">
                    &gt;
                  </span>
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Auth State */}
            {user && isSignedIn ? (
              <Link
                href="/portal/dashboard"
                className="hidden md:flex items-center gap-3 group px-3 py-1.5 rounded-lg border border-transparent hover:border-[#1a1a28] hover:bg-[#0a0a14] transition-all"
              >
                <div className="text-right">
                  <div className="text-[10px] font-bold text-[#dde1f0] uppercase tracking-widest">
                    {user.fullName || "Operator"}
                  </div>
                  <div className="text-[9px] text-[#4ade80] uppercase tracking-widest flex items-center gap-1 justify-end">
                    <div className="w-1 h-1 rounded-full bg-[#4ade80] animate-pulse" />
                    Authorized
                  </div>
                </div>
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-[#1a1a28] group-hover:border-[#7b8cde]/50 transition-colors">
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
            ) : (
              <Link
                href="/portal"
                className="hidden md:flex items-center gap-2 text-[10px] font-bold text-[#555] hover:text-[#dde1f0] uppercase tracking-widest transition-colors px-2"
              >
                <User size={14} className="text-[#7b8cde]" />
                Authenticate
              </Link>
            )}

            {/* CTA Button */}
            <Link
              href="/buy"
              className="hidden md:flex items-center gap-2 bg-[#7b8cde] text-[#080810] text-[10px] font-bold px-5 py-2.5 rounded-md hover:bg-[#8d9de8] transition-all shadow-[0_0_15px_rgba(123,140,222,0.15)] uppercase tracking-widest"
            >
              Deploy Node
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-[#555] hover:text-[#dde1f0] bg-[#0a0a14] border border-[#1a1a28] rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#080810]/98 backdrop-blur-xl pt-24 px-6 transition-all duration-300 md:hidden font-mono flex flex-col ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col space-y-2 flex-1">
          <div className="text-[10px] text-[#555] uppercase tracking-widest mb-4">
            System Navigation
          </div>
          
          {[
            { name: "Overview", path: "/" },
            { name: "Specs", path: "/specs" },
            { name: "Downloads", path: "/downloads" }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 border border-[#1a1a28] rounded-lg bg-[#0c0c16] text-[#dde1f0] text-xs font-bold uppercase tracking-widest active:bg-[#151522]"
            >
              {item.name}
              <ChevronRight size={14} className="text-[#555]" />
            </Link>
          ))}

          <div className="pt-8 flex flex-col gap-3 mt-auto mb-10">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-[#1a1a28] bg-[#0a0a14] text-[#dde1f0] text-xs font-bold uppercase tracking-widest active:bg-[#151522]"
            >
              <User size={14} className="text-[#7b8cde]" /> 
              Portal Access
            </Link>
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-[#7b8cde] text-[#080810] text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(123,140,222,0.2)]"
            >
              Deploy Node <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
