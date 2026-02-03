import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { PortalProvider } from "@/providers/PortalProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeeStation - Your Personal Cloud Journey",
  description: "Create your own personal cloud with BeeStation.",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <PortalProvider>
            {children}
          </PortalProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
