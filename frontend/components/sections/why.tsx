"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Share2, Search, Grid } from "lucide-react";
import Image from "next/image";

export default function Why() {
  const [currentSlide, setCurrentSlide] = useState(1);

  const slides = [
    {
      id: 0,
      title: "Share with ease",
      desc: "Create links to share files or folders with anyone, even if they don't have a BeeStation account.",
      screenContent: <SharingScreen />,
    },
    {
      id: 1,
      title: "Find people, pets, and more",
      desc: "Let built-in AI and keyword search help you find photos of loved ones and precious moments.",
      screenContent: <SubjectsScreen />,
    },
    {
      id: 2,
      title: "Explore by location",
      desc: "View your photos on a world map to relive your travels and adventures.",
      screenContent: <MapScreen />,
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="w-full bg-white text-[#1d1d1f] overflow-hidden">
      
      <div className="py-24 px-6 text-center max-w-[1400px] mx-auto">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Your memories at your fingertips
          </h2>
          <p className="text-gray-600 text-lg">
            Back up your camera roll to relive life's moments no matter where you are, 
            freeing up phone space while you're at it.
          </p>
        </div>

        <div className="relative h-[600px] w-full flex justify-center items-center">
          
          <div className="absolute top-10 left-[5%] md:left-[15%] w-32 h-24 bg-gray-200 rounded-lg shadow-lg rotate-[-6deg] z-0 overflow-hidden hidden md:block">
            <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=300)'}}></div>
          </div>
          <div className="absolute top-40 left-[-5%] md:left-[5%] w-40 h-28 bg-gray-200 rounded-lg shadow-lg rotate-[3deg] z-10 overflow-hidden hidden lg:block">
             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300)'}}></div>
          </div>
          <div className="absolute bottom-20 left-[10%] md:left-[18%] w-36 h-48 bg-gray-200 rounded-lg shadow-lg rotate-[-3deg] z-0 overflow-hidden hidden md:block">
             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=300)'}}></div>
          </div>
          
          <div className="absolute top-12 right-[5%] md:right-[15%] w-32 h-24 bg-gray-200 rounded-lg shadow-lg rotate-[6deg] z-0 overflow-hidden hidden md:block">
             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=300)'}}></div>
          </div>
           <div className="absolute top-44 right-[-2%] md:right-[8%] w-28 h-20 bg-gray-200 rounded-lg shadow-lg rotate-[-4deg] z-0 overflow-hidden hidden lg:block">
             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=300)'}}></div>
          </div>
          <div className="absolute bottom-24 right-[12%] md:right-[20%] w-32 h-32 bg-gray-200 rounded-lg shadow-lg rotate-[4deg] z-0 overflow-hidden hidden md:block">
             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=300)'}}></div>
          </div>


          <div className="relative z-20 w-[280px] h-[580px] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-[#333]">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30"></div>
             
             <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col relative">
                <div className="h-10 flex justify-between items-center px-6 text-xs font-bold text-black pt-2">
                    <span>15:09</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-3 bg-black rounded-sm"></div>
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                </div>

                <div className="flex-1 px-4 pt-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Albums</h3>
                        <div className="flex gap-3">
                            <Search size={20} />
                            <div className="w-5 h-5 border-2 border-black rounded-md flex items-center justify-center">+</div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 text-xs font-medium no-scrollbar">
                        <div className="flex flex-col items-center gap-2 min-w-[60px]">
                            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover"/></div>
                            <span>People</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 min-w-[60px]">
                            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover"/></div>
                            <span>Subjects</span>
                        </div>
                         <div className="flex flex-col items-center gap-2 min-w-[60px]">
                            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center"><MapPin size={20} className="text-blue-500"/></div>
                            </div>
                            <span>Places</span>
                        </div>
                    </div>

                    <div className="text-sm font-bold mb-2 text-gray-800">All Albums</div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-3">
                             <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">Lucas's Birthday</div>
                             </div>
                             <div className="h-32 bg-gray-100 rounded-xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <div className="space-y-3 pt-6">
                             <div className="h-32 bg-gray-100 rounded-xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" />
                             </div>
                             <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">Summer Trip</div>
                             </div>
                        </div>
                    </div>
                </div>

             </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-white overflow-hidden">
        <div className="text-center mb-16 px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Take the work out of photo organization</h2>
        </div>

        <div className="relative max-w-[1200px] mx-auto h-[600px] flex items-center justify-center">
            
            <button onClick={prevSlide} className="absolute left-4 md:left-10 z-30 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors hidden md:block">
                <ChevronLeft />
            </button>

            <div className="flex items-center justify-center gap-8 md:gap-16 perspective-1000 relative w-full px-4">
                
                <div className="hidden md:block opacity-40 scale-90 blur-[1px] transform transition-all duration-500 ease-in-out">
                    <PhoneMockup content={slides[currentSlide === 0 ? 2 : currentSlide - 1].screenContent} />
                </div>

                <div className="z-20 transform transition-all duration-500 ease-in-out scale-100 shadow-2xl rounded-[3rem]">
                    <PhoneMockup content={slides[currentSlide].screenContent} active />
                </div>

                <div className="hidden md:block opacity-40 scale-90 blur-[1px] transform transition-all duration-500 ease-in-out">
                     <PhoneMockup content={slides[currentSlide === 2 ? 0 : currentSlide + 1].screenContent} />
                </div>

            </div>

             <button onClick={nextSlide} className="absolute right-4 md:right-10 z-30 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors hidden md:block">
                <ChevronRight />
            </button>
        </div>
        
        <div className="text-center mt-12 max-w-2xl mx-auto px-6 transition-opacity duration-300">
            <h3 className="text-xl font-bold mb-2">{slides[currentSlide].title}</h3>
            <p className="text-gray-500 text-sm">{slides[currentSlide].desc}</p>
            
            <div className="flex justify-center gap-2 mt-6">
                {slides.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-[#ffc233]' : 'bg-gray-300'}`}
                    />
                ))}
            </div>
        </div>

      </div>

      <div className="w-full bg-[#3e3b32] text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            <div className="flex flex-col justify-center p-12 md:p-20 max-w-xl mx-auto lg:mx-0 lg:ml-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Privacy by design with built-in AI</h2>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    BeeStation's built-in AI performs photo recognition without sending any data to the cloud. 
                    The integrated Neural Processing Unit (NPU) helps boost AI processing speeds, 
                    so that other applications can continue to operate smoothly.
                </p>
            </div>
            
            <div className="relative h-64 lg:h-auto w-full bg-[#2a2822]">
                 <Image 
                    src="https://images.unsplash.com/photo-1520697830682-8af9d1502b71?q=80&w=2787&auto=format&fit=crop" 
                    alt="Privacy concept"
                    fill
                    className="object-cover opacity-80"
                 />
            </div>
        </div>
      </div>

    </section>
  );
}

function PhoneMockup({ content, active = false }: { content: React.ReactNode, active?: boolean }) {
    return (
        <div className={`w-[260px] md:w-[280px] h-[540px] md:h-[580px] bg-white rounded-[3rem] border-[8px] md:border-[10px] border-gray-900 overflow-hidden relative flex flex-col ${active ? 'shadow-[0_20px_50px_rgba(0,0,0,0.2)]' : ''}`}>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-30"></div>
             
             <div className="h-10 w-full flex justify-between items-center px-6 pt-3 text-[10px] font-bold text-black z-20">
                <span>10:08</span>
                <div className="flex gap-1">
                     <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
             </div>

             <div className="flex-1 bg-white overflow-hidden relative">
                {content}
             </div>
        </div>
    );
}

function SubjectsScreen() {
    const categories = [
        { name: "Dogs", count: 49, img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150" },
        { name: "Cats", count: 42, img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150" },
        { name: "Food", count: 213, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=150" },
        { name: "Italian", count: 20, img: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&q=80&w=150" },
        { name: "Japanese", count: 36, img: "https://images.unsplash.com/photo-1580822184713-fc54006efa4e?auto=format&fit=crop&q=80&w=150" },
        { name: "Picnics", count: 6, img: "https://images.unsplash.com/photo-1530268729831-4b0b9791c404?auto=format&fit=crop&q=80&w=150" },
        { name: "Sky", count: 56, img: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=150" },
        { name: "Forests", count: 128, img: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?auto=format&fit=crop&q=80&w=150" },
        { name: "Lakes", count: 85, img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=150" },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="px-5 py-2 flex items-center justify-between">
                <h3 className="font-bold text-xl">Subjects</h3>
                <Search size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 overflow-y-hidden p-4">
                <div className="grid grid-cols-3 gap-x-2 gap-y-6">
                    {categories.map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center gap-1">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight">{cat.name}</span>
                            <span className="text-[9px] text-gray-400 leading-none">{cat.count} Item</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MapScreen() {
    return (
        <div className="h-full relative bg-blue-50">
             <div className="absolute top-2 left-4 z-10 font-bold flex items-center gap-2 text-gray-500 text-xs">
                <ChevronLeft size={14} /> Albums
             </div>
             <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center"></div>
             
             <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                 <div className="bg-white p-1 rounded-md shadow-md mb-1 animate-bounce">
                    <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=50" className="w-8 h-8 object-cover rounded-sm" />
                 </div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-500/30"></div>
             </div>

             <div className="absolute bottom-1/3 left-1/4 flex flex-col items-center">
                 <div className="bg-white p-1 rounded-md shadow-md mb-1">
                    <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=50" className="w-8 h-8 object-cover rounded-sm" />
                 </div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-500/30"></div>
             </div>
        </div>
    )
}

function SharingScreen() {
     return (
        <div className="h-full bg-gray-50 p-4">
             <div className="flex justify-between items-center mb-6 mt-2">
                 <h3 className="font-bold text-lg">Sharing</h3>
                 <Search size={18} className="text-gray-400" />
             </div>
             
             <div className="space-y-4">
                {[1,2,3].map((i) => (
                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex gap-3 items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                             <img src={`https://source.unsplash.com/random/100x100?sig=${i}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-xs">Family Vacation 2024</div>
                            <div className="text-[10px] text-gray-500">Link expires in 2 days</div>
                        </div>
                        <Share2 size={16} className="text-blue-500" />
                    </div>
                ))}
             </div>
        </div>
    )
}