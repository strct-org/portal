"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";

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

  // Loading state to prevent flash
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#6c47ff]"></div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-sans text-gray-900">
      {/* Background Image */}
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
          {/* Logo Section */}
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

          {/* === LOGIC: Signed In vs Signed Out === */}
          {isSignedIn && user ? (
            /* 1. USER IS LOGGED IN: Show Profile Card to Continue */
            <>
              <button
                onClick={handleContinue}
                className="group mb-6 flex w-full items-center gap-4 rounded-xl bg-gray-100/80 p-4 text-left transition-colors hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-bold text-gray-900 group-hover:text-black">
                    {user.fullName || user.username || "BeeStation User"}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </button>

              <div className="text-xs text-gray-500 leading-relaxed">
                Continue with this account or <br />
                <button
                  onClick={handleSignOut}
                  className="underline decoration-gray-400 underline-offset-2 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                >
                  sign in to another
                </button>
                .
              </div>
            </>
          ) : (
            /* 2. USER IS LOGGED OUT: Single Google Auth Button */
            /* Ensure Google is enabled in Clerk Dashboard > User & Authentication > Social Connections */
            <div className="mb-6">
              <SignInButton mode="modal">
                <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2D3748] p-4 font-bold text-white transition-all hover:bg-black hover:shadow-lg cursor-pointer">
                  {/* Google Icon SVG */}
                  <svg
                    className="h-5 w-5 bg-white rounded-full p-0.5"
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
                  <span>Continue with Google</span>
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

// --- Components ---

function Footer() {
  return (
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
