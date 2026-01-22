// app/portal/register/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBC02D] text-xl font-bold text-white">
            B
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500">Join the Synology ecosystem</p>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="First Name" />
            <Input placeholder="Last Name" />
          </div>
          <Input type="email" placeholder="Email Address" />
          <Input type="password" placeholder="Password" />

          <div className="text-xs text-gray-500 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>

          <Button fullWidth>Create Account</Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/portal"
            className="font-semibold text-[#FBC02D] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
