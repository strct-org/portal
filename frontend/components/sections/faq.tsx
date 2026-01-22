"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Do I need a public IP address to use BeeStation?",
    answer:
      "No. BeeStation is designed to work without complicated network settings. Simply sign in with your Synology Account, and you can access your files from anywhere via the portal.",
  },
  {
    question: "Can I back up my phone photos automatically?",
    answer:
      "Yes! The mobile app allows for automatic background backups of all your photos and videos, releasing space on your device instantly.",
  },
  {
    question: "Is my data encrypted?",
    answer:
      "BeeStation treats your privacy as a priority. Your data is stored locally on your device, and remote access is secured via industry-standard encryption protocols.",
  },
  {
    question: "What is the difference between BeeStation and BeeDrive?",
    answer:
      "BeeStation is a personal cloud connected to the internet for anywhere access. BeeDrive is a direct-attached storage device (USB) focused on high-speed local computer backup.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-300 ${
                openIndex === idx
                  ? "bg-gray-50 p-6"
                  : "bg-white p-4 hover:bg-gray-50/50"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span
                  className={`text-lg font-semibold transition-colors ${
                    openIndex === idx ? "text-[#FBC02D]" : "text-gray-900"
                  }`}
                >
                  {faq.question}
                </span>
                <span
                  className={`p-2 rounded-full transition-colors ${
                    openIndex === idx
                      ? "bg-[#FBC02D] text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}
                >
                  {openIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  openIndex === idx ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-600 leading-relaxed pb-2">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
