"use client";

export const ProductComparison = () => {
  return (
    <section className="py-24 bg-white text-[#1d1d1f]">
      <div className="max-w-[1000px] mx-auto px-6">
        
        <p className="text-center text-gray-600 mb-16 text-lg">
          Check out the table below to see which BeeStation suits your needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="hidden md:block"></div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-32 bg-gradient-to-r from-[#3d3d40] to-[#2b2b2e] rounded-md shadow-lg mb-8 relative border-r border-white/20">
               <div className="absolute bottom-3 right-1/2 translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_white]"></div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">BeeStation (BST150-4T)</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[280px] mb-6 min-h-[40px]">
              Personal cloud storage for effortless control of your files and photos
            </p>
            <button className="bg-[#ffc233] text-[#1d1d1f] px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#ecc04d] transition-colors">
              Learn more
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-36 bg-gradient-to-r from-[#6e6e73] to-[#515154] rounded-md shadow-lg mb-4 relative border-r border-white/20">
               <div className="absolute bottom-3 right-1/2 translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_white]"></div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">BeeStation Plus (BST170-8T)</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[280px] mb-6 min-h-[40px]">
              Private and family cloud storage for managing and organizing digital assets
            </p>
            <button className="bg-[#ffc233] text-[#1d1d1f] px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#ecc04d] transition-colors">
              Learn more
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200">
          
          <div className="grid grid-cols-1 md:grid-cols-3 py-8 border-b border-gray-200 items-center">
            <div className="font-bold text-[#1d1d1f] mb-2 md:mb-0">Capacity</div>
            <div className="text-center text-gray-600">4 TB<sup className="text-[10px] ml-0.5">4</sup></div>
            <div className="text-center text-gray-600 mt-2 md:mt-0">8 TB<sup className="text-[10px] ml-0.5">4</sup></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 py-8 border-b border-gray-200 items-center">
            <div className="font-bold text-[#1d1d1f] mb-2 md:mb-0">Processor</div>
            <div className="text-center text-gray-600">Realtek RTD1619B</div>
            <div className="text-center text-gray-600 mt-2 md:mt-0">Intel Celeron J4125</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 py-8 border-b border-gray-200 items-center">
            <div className="font-bold text-[#1d1d1f] mb-2 md:mb-0">Memory</div>
            <div className="text-center text-gray-600">1 GB DDR4</div>
            <div className="text-center text-gray-600 mt-2 md:mt-0">4 GB DDR4</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 py-8 border-b border-gray-200 items-center">
            <div className="font-bold text-[#1d1d1f] mb-2 md:mb-0">LAN port</div>
            <div className="text-center text-gray-600">1 × 1GbE RJ-45</div>
            <div className="text-center text-gray-600 mt-2 md:mt-0">1 × 1GbE RJ-45</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 py-8 border-b border-gray-200 items-start">
            <div className="font-bold text-[#1d1d1f] mb-2 md:mb-0 pt-1">External ports</div>
            <div className="text-center text-gray-600 flex flex-col gap-1">
              <span>1 x USB-A 3.2 Gen 1 port</span>
              <span>1 x USB-C 3.2 Gen 1 port</span>
            </div>
            <div className="text-center text-gray-600 flex flex-col gap-1 mt-4 md:mt-0">
              <span>1 x USB-A 3.2 Gen 1 port</span>
              <span>1 x USB-C 3.2 Gen 1 port</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
