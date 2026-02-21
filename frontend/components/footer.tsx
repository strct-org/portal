"use client";
import { 
  Terminal, 
  Github,
  Twitter,
  Disc,
  Cpu
} from "lucide-react";

export default function Footer() {
  return (
    <footer 
      className="bg-[#080810] border-t border-[#1a1a28] pt-16 pb-8 font-mono text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-16">
        <div>
          <h4 className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Cpu size={14} className="text-[#fbbf24]" />
            Hardware
          </h4>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Strct Node v1
              </a>
            </li>
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Strct Drive
              </a>
            </li>
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Modules
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Terminal size={14} className="text-[#60a5fa]" />
            Support
          </h4>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Client Binaries
              </a>
            </li>
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                API Specs
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest mb-6">
            Corporation
          </h4>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                About Strct
              </a>
            </li>
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Press / Media
              </a>
            </li>
            <li>
              <a href="#" className="text-[10px] text-[#555] hover:text-[#7b8cde] uppercase tracking-widest transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#1a1a28] before:rounded-full hover:before:bg-[#7b8cde]">
                Distributors
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#dde1f0] uppercase tracking-widest mb-6">
            Comms Links
          </h4>
          <div className="flex gap-3">
            <a href="#" className="p-2.5 bg-[#0a0a14] border border-[#1a1a28] rounded-lg text-[#555] hover:text-[#dde1f0] hover:border-[#555] transition-colors">
              <Twitter size={16} />
            </a>
            <a href="#" className="p-2.5 bg-[#0a0a14] border border-[#1a1a28] rounded-lg text-[#555] hover:text-[#dde1f0] hover:border-[#555] transition-colors">
              <Github size={16} />
            </a>
            <a href="#" className="p-2.5 bg-[#0a0a14] border border-[#1a1a28] rounded-lg text-[#555] hover:text-[#dde1f0] hover:border-[#555] transition-colors">
              <Disc size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="pt-6 border-t border-[#1a1a28] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[9px] text-[#555] uppercase tracking-widest text-center md:text-left">
            © 2026 Strct Inc. // All System Rights Reserved.
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a1a0a] border border-[#1a4a1a] rounded text-[9px] text-[#4ade80] uppercase tracking-widest font-bold">
            <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse" />
            Global Network Online
          </div>
        </div>
      </div>
    </footer>
  );
}