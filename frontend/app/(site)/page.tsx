"use client";

import { useState, useEffect } from "react";
import FAQ from "@/components/sections/faq";
import { ProductComparison } from "@/components/sections/comparison";
import { Visulas } from "@/components/sections/visula_images";
import Why from "@/components/sections/why";
import Link from "next/link";
import { motion } from "framer-motion";

const easeCustom = [0.25, 0.1, 0.25, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: easeCustom as any },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const imagePop = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.2, ease: easeCustom as any },
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
    viewport={{ once: true, margin: "-100px" }} // Triggers when 100px into view
    transition={{ delay, duration: 0.8, ease: easeCustom as any }}
    variants={fadeInUp}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setLoaded(true), []);

  return (
    <main
      className={`font-sans antialiased text-[#1d1d1f] bg-[#e3e1db] min-h-screen transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <section className="relative pt-32 pb-0 md:pt-32 lg:pt-40 overflow-hidden min-h-[90vh] flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ebe9e4] via-[#e3e1db] to-[#d6d4ce] -z-20"></div>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#dcdad5] to-transparent opacity-50 -z-10 blur-3xl"></div>

        <div className="max-w-[1400px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          <motion.div
            className="lg:col-span-5 flex flex-col justify-center lg:block text-center lg:text-left pt-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="text-2xl text-[#555] font-medium block mb-3"
            >
              BeeStation
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight mb-10 text-[#24292f]"
            >
              Create your own cloud <br />
              in minutes
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-16"
            >
              <Link
                href="/buy"
                className="bg-[#ffc233] text-[#1d1d1f] px-10 py-3.5 text-center rounded-full font-semibold text-[17px] hover:bg-[#ecc04d] transition-colors shadow-sm min-w-[140px]"
              >
                Buy
              </Link>
              <Link
                href="/portal"
                className="bg-transparent border border-[#888] text-[#1d1d1f] px-8 py-3.5 text-center rounded-full font-medium text-[17px] hover:bg-black/5 transition-colors min-w-[140px]"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-[#f0efed]/80 backdrop-blur-md border border-white/40 p-5 rounded-xl inline-block max-w-xs text-left shadow-sm"
            >
              <div className="text-[#002855] font-bold text-lg mb-1 flex items-center gap-1">
                Acronis{" "}
                <span className="font-normal text-[#444]">True Image</span>
              </div>
              <p className="text-[#002855] text-sm font-medium">
                Three-year protection included
              </p>
            </motion.div>
          </motion.div>

          <div className="lg:col-span-7 relative h-[600px] lg:h-auto flex items-end justify-center lg:justify-end gap-8 pb-10">
            <motion.div
              className="relative z-20 flex flex-col items-center"
              initial="hidden"
              animate="visible"
              variants={imagePop}
              custom={1} // Used if we wanted dynamic delay based on index
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-16 left-0 bg-transparent border border-gray-500 text-gray-700 text-xs font-semibold px-2 py-1 rounded-[4px]"
              >
                BeeStation
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -top-10 left-4 w-1.5 h-1.5 bg-red-500 rounded-full"
              ></motion.div>

              <div className="w-32 md:w-44 h-52 md:h-64 bg-gradient-to-r from-[#2a2a2c] to-[#1c1c1e] rounded-lg shadow-2xl flex flex-col items-center justify-end pb-4 relative border-r border-white/10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                  <div className="w-8 h-8 border-2 border-white rounded rotate-45"></div>
                </div>
                <div className="w-1 h-1 bg-white rounded-full opacity-80 shadow-[0_0_10px_white]"></div>
              </div>

              <div className="w-40 md:w-52 h-32 bg-[#dcdad5] rounded-t-[50%] -mt-6 shadow-[inset_0_10px_20px_rgba(0,0,0,0.05)] relative -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#d1cfc9] rounded-t-[50%]"></div>
              </div>
            </motion.div>

            <motion.div
              className="relative z-10 flex flex-col items-center mb-10 md:mb-0"
              initial="hidden"
              animate="visible"
              variants={imagePop}
              transition={{
                delay: 0.3,
                duration: 1.2,
                ease: easeCustom as any,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="absolute -top-12 left-0 bg-transparent border border-gray-500 text-gray-700 text-xs font-semibold px-2 py-1 rounded-[4px]"
              >
                BeeStation Plus
              </motion.div>

              <div className="w-40 md:w-56 h-64 md:h-80 bg-gradient-to-r from-[#5a5a5e] to-[#454547] rounded-lg shadow-2xl flex flex-col items-center justify-end pb-6 relative border-r border-white/10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                  <div className="w-10 h-10 border-2 border-white rounded rotate-45"></div>
                </div>
                <div className="w-1 h-1 bg-white rounded-full opacity-80 shadow-[0_0_10px_white]"></div>
              </div>

              <div className="w-48 md:w-72 h-40 bg-[#dcdad5] rounded-t-[50%] -mt-8 shadow-[inset_0_10px_20px_rgba(0,0,0,0.05)] relative -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#d1cfc9] rounded-t-[50%]"></div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full max-w-[1400px] mx-auto px-6 mt-auto"
        >
          <div className="flex gap-8 pb-4 border-b border-transparent">
            <div className="flex flex-col gap-2 cursor-pointer group">
              <span className="text-[#1d1d1f] font-bold text-lg">Features</span>
              <div className="h-[3px] w-full bg-[#ffc233] rounded-full"></div>
            </div>
            <div className="flex flex-col gap-2 cursor-pointer group">
              <span className="text-gray-500 font-bold text-lg group-hover:text-[#1d1d1f] transition-colors">
                Specs
              </span>
              <div className="h-[3px] w-full bg-transparent group-hover:bg-gray-300 rounded-full transition-colors"></div>
            </div>
          </div>
        </motion.div>
      </section>

      <SectionWrapper>
        <ProductComparison />
      </SectionWrapper>

      <SectionWrapper delay={0.2}>
        <Why />
      </SectionWrapper>

      <SectionWrapper>
        <Visulas />
      </SectionWrapper>

      <div className="bg-white ">
        <div className="max-w-[1000px] mx-auto px-6 py-8">
          <SectionWrapper>
            <FAQ />
          </SectionWrapper>
        </div>
      </div>
    </main>
  );
}