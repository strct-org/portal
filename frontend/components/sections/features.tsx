import { ShieldCheck, Users, Zap, Smartphone, Globe, Lock } from "lucide-react";

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Multi-user spaces",
    desc: "Create private storage spaces for each family member. Everyone gets their own personal cloud.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Data ownership",
    desc: "100% data ownership. No subscription fees, no data mining. Your files stay on your hardware.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "AI-powered photo org",
    desc: "Built-in NPU automatically recognizes faces and objects to organize your albums instantly.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile backup",
    desc: "Free up space on your phone. Photos are backed up the moment you walk through the door.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Anywhere access",
    desc: "Access files from a browser, desktop, or mobile app without configuring routers.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Hardware encryption",
    desc: "Enterprise-grade security features built into a consumer-friendly device.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-[#111] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FBC02D]/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-[#FBC02D] font-bold tracking-wider uppercase text-xs mb-4 block">
            Why Strct BeeStation?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Designed by Synology <br />
            <span className="text-gray-500">with you in mind.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We took our 20 years of enterprise storage experience and distilled
            it into our most personal, user-friendly device ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FBC02D] text-black flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(251,192,45,0.3)]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
