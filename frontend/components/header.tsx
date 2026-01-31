"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePortal } from "@/providers/PortalProvider";
import Image from "next/image";

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          isScrolled
            ? "bg-white/85 backdrop-blur-xl border-gray-200/60 py-3 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]"
            : "bg-opacity backdrop-blur-md border-transparent py-5 "
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#FBC02D]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5 font-bold"
                  strokeWidth="3"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Strct
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
              {["Overview", "Specs", "Downloads"].map((item) => (
                <Link
                  key={item}
                  href={item === "Overview" ? "/" : `/${item.toLowerCase()}`}
                  className="relative hover:text-black transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#FBC02D] after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && isSignedIn ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <Link
                href="/portal"
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black px-4 py-2 transition-colors"
              >
                <User size={18} className="stroke-[2.5px]" />
                Sign In
              </Link>
            )}

            <div className="hidden md:flex items-center gap-2 bg-[#1d1d1f] text-white text-[14px] font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-gray-900/10">
              <Link href="/buy">Buy Now</Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-white pt-24 px-6 transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col space-y-6 text-lg font-medium text-gray-900">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="border-b border-gray-100 pb-4"
          >
            Overview
          </Link>
          <Link
            href="/specs"
            onClick={() => setMobileMenuOpen(false)}
            className="border-b border-gray-100 pb-4"
          >
            Specs
          </Link>
          <Link
            href="/downloads"
            onClick={() => setMobileMenuOpen(false)}
            className="border-b border-gray-100 pb-4"
          >
            Downloads
          </Link>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/portal"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold"
            >
              <User size={18} /> Portal Login
            </Link>
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FBC02D] text-white font-bold shadow-md">
              Buy Strct <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
