"use client";

import React from "react";
import { FileText, Download, ChevronRight, Search } from "lucide-react";

const manuals = [
  {
    title: "BeeStation User Guide",
    lang: "English",
    size: "2.4 MB",
    type: "PDF",
    desc: "Comprehensive guide for setting up and managing your BeeStation.",
  },
  {
    title: "Hardware Installation Guide",
    lang: "Multilingual",
    size: "1.8 MB",
    type: "PDF",
    desc: "Step-by-step hardware setup and safety instructions.",
  },
  {
    title: "Synology BeeStation Datasheet",
    lang: "English",
    size: "0.5 MB",
    type: "PDF",
    desc: "Technical specifications and feature highlights.",
  },
];

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Download Center
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Find the latest documents, manuals, and guides for your Strct
          BeeStation.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-2 flex items-center max-w-md">
          <div className="p-3 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#FBC02D] rounded-full"></span>
          Documents & Manuals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manuals.map((doc, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FBC02D]">
                  <FileText size={24} />
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                  {doc.type}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FBC02D] transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {doc.desc}
              </p>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-900">
                    {doc.lang}
                  </span>
                  <span className="text-xs text-gray-400">{doc.size}</span>
                </div>

                <button className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center group-hover:bg-[#FBC02D] transition-colors">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
