"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, ShieldCheck, ChevronRight, Server, Activity, Cpu } from "lucide-react";

// Assuming these imported components will also be adapted to the dark theme eventually,
// we will wrap them in dark-themed containers for now.
import FAQ from "@/components/sections/faq";
import { ProductComparison } from "@/components/sections/comparison";
import { Visulas } from "@/components/sections/visula_images";
import Why from "@/components/sections/why";

const easeCustom = [0.25, 0.1, 0.25, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeCustom as any },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const nodePop = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.0, ease: easeCustom as any },
  },
};

const SectionWrapper = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.6, ease: easeCustom as any }}
    variants={fadeInUp}
    className="relative z-10"
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(true), []);

  return (
    <main
      className={`font-mono antialiased text-[#dde1f0] bg-[#080810] min-h-screen transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-0 md:pt-40 lg:pt-48 overflow-hidden min-h-[90vh] flex flex-col justify-between border-b border-[#1a1a28]">
        
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#151522_1px,transparent_1px),linear-gradient(to_bottom,#151522_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 -z-20" />
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#7b8cde]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4ade80]/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* Text Content */}
          <motion.div
            className="lg:col-span-6 flex flex-col justify-center text-left pt-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
              <Terminal size={14} className="text-[#fbbf24]" />
              <span className="text-xs font-bold text-[#fbbf24] uppercase tracking-widest">
                // System Initialization
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-8 text-[#dde1f0] uppercase"
            >
              Deploy Your <br />
              <span className="text-[#7b8cde] relative inline-block">
                Local Data Node
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#7b8cde]/30 rounded-full" />
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-[#888] text-sm md:text-base mb-10 max-w-lg leading-relaxed">
              Bypass public clouds. Establish a secure, localized infrastructure for file storage, network routing, and telemetry mitigation in minutes.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-start items-center mb-16"
            >
              <Link
                href="/buy"
                className="w-full sm:w-auto bg-[#7b8cde] text-[#080810] px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#8d9de8] transition-all shadow-[0_0_20px_rgba(123,140,222,0.2)] flex items-center justify-center gap-2"
              >
                <Cpu size={16} /> Deploy Node
              </Link>
              <Link
                href="/portal"
                className="w-full sm:w-auto bg-[#0a0a14] border border-[#1a1a28] text-[#dde1f0] px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#0e0e1a] hover:border-[#555] transition-all flex items-center justify-center gap-2"
              >
                <Server size={16} className="text-[#555]" /> Portal Access
              </Link>
            </motion.div>

            {/* Promo Badge */}
            <motion.div
              variants={fadeInUp}
              className="bg-[#0a0a14] border border-[#1a1a28] p-4 rounded-xl inline-flex flex-col max-w-xs shadow-sm"
            >
              <div className="text-[#4ade80] font-bold text-[11px] mb-1.5 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck size={14} />
                E2E Encryption Protocol
              </div>
              <p className="text-[#555] text-[10px] uppercase tracking-widest">
                Military-grade tunneling pre-configured on all nodes.
              </p>
            </motion.div>
          </motion.div>

          {/* Visual Content (Hardware Nodes) */}
          <div className="lg:col-span-6 relative h-[500px] lg:h-auto flex items-end justify-center lg:justify-end gap-6 pb-10">
            
            {/* Base Node */}
            <motion.div
              className="relative z-20 flex flex-col items-center"
              initial="hidden"
              animate="visible"
              variants={nodePop}
              custom={1}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-12 left-0 bg-[#0a0a14] border border-[#1a1a28] text-[#dde1f0] text-[9px] font-bold px-3 py-1.5 rounded uppercase tracking-widest shadow-xl flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
                Strct_Base
              </motion.div>

              {/* Server Chassis */}
              <div className="w-32 md:w-44 h-52 md:h-64 bg-[#0c0c16] rounded-xl border border-[#1a1a28] shadow-2xl flex flex-col items-center justify-between py-6 relative overflow-hidden group hover:border-[#fbbf24]/30 transition-colors">
                {/* Vents */}
                <div className="w-full px-4 space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-0.5 w-full bg-[#151522] rounded-full" />
                  ))}
                </div>
                {/* Indicator LED */}
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full shadow-[0_0_8px_#fbbf24]" />
                  <div className="text-[8px] text-[#555] uppercase tracking-widest font-bold">STBY</div>
                </div>
                {/* Side highlight */}
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#ffffff10] to-transparent" />
              </div>
            </motion.div>

            {/* Pro Node */}
            <motion.div
              className="relative z-10 flex flex-col items-center mb-10 md:mb-0"
              initial="hidden"
              animate="visible"
              variants={nodePop}
              transition={{ delay: 0.3, duration: 1.0, ease: easeCustom as any }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="absolute -top-16 left-0 bg-[#0a0a14] border border-[#1a4a1a] text-[#4ade80] text-[9px] font-bold px-3 py-1.5 rounded uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.1)] flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                Strct_Pro
              </motion.div>

              {/* Server Chassis */}
              <div className="w-40 md:w-56 h-64 md:h-80 bg-[#080810] rounded-xl border border-[#1a1a28] shadow-2xl flex flex-col items-center justify-between py-6 relative overflow-hidden group hover:border-[#4ade80]/30 transition-colors">
                {/* Internal Glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#7b8cde]/5 rounded-full blur-xl" />
                
                {/* Vents */}
                <div className="w-full px-5 space-y-1.5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-0.5 w-full bg-[#151522] rounded-full" />
                  ))}
                </div>
                
                {/* Digital Display / Indicators */}
                <div className="mt-auto w-full px-5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_8px_#4ade80] animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full" />
                  </div>
                  <div className="text-[8px] font-mono text-[#7b8cde] border border-[#1a1a28] px-1.5 py-0.5 rounded bg-[#0a0a14]">
                    ACTV
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#ffffff15] to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full max-w-6xl mx-auto px-6 mt-auto relative z-20"
        >
          <div className="flex gap-8 pb-4">
            <div className="flex flex-col gap-2 cursor-pointer group">
              <span className="text-[#dde1f0] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-[#7b8cde]" /> System_Modules
              </span>
              <div className="h-[2px] w-full bg-[#7b8cde] shadow-[0_0_10px_#7b8cde]" />
            </div>
            <div className="flex flex-col gap-2 cursor-pointer group">
              <span className="text-[#555] font-bold text-xs uppercase tracking-widest group-hover:text-[#dde1f0] transition-colors flex items-center gap-2">
                <Server size={14} /> Tech_Specs
              </span>
              <div className="h-[2px] w-full bg-transparent group-hover:bg-[#1a1a28] transition-colors" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 
        Below we render the imported sections.
        Wrapping them in styled containers to try and force dark-mode compliance
        if they rely on inherited text/background colors.
      */}

      <div className="bg-[#080810] text-[#dde1f0] border-b border-[#1a1a28]">
        <SectionWrapper>
          <ProductComparison />
        </SectionWrapper>
      </div>

      <div className="bg-[#0a0a14] text-[#dde1f0] border-b border-[#1a1a28]">
        <SectionWrapper delay={0.2}>
          <Why />
        </SectionWrapper>
      </div>

      <div className="bg-[#080810] text-[#dde1f0] border-b border-[#1a1a28]">
        <SectionWrapper>
          <Visulas />
        </SectionWrapper>
      </div>

      <div className="bg-[#0c0c16] text-[#dde1f0]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <SectionWrapper>
            <div className="mb-10 text-center">
              <h2 className="text-xl font-bold text-[#dde1f0] uppercase tracking-widest mb-2">
                Knowledge Base
              </h2>
              <p className="text-[11px] text-[#555] uppercase tracking-widest">
                Frequently Queried Datapoints
              </p>
            </div>
            <FAQ />
          </SectionWrapper>
        </div>
      </div>
    </main>
  );
}