'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
// ^ Optional: if you’re using Heroicons for the “X” icon. Otherwise, replace with your own.

interface MobileFilterOverlayProps {
   // You could pass in your filter data here (e.g., arrays of sizes, colors, etc.)
   // or simply have them imported if they’re static. This example is minimal.
}

const MobileFilterOverlay: React.FC<MobileFilterOverlayProps> = () => {
   const [isOpen, setIsOpen] = useState(false);

   // Toggle the overlay
   const handleToggle = () => {
      setIsOpen((prev) => !prev);
   };

   return (
      <>
         {/* The "Filter" button, visible on mobile */}
         <button
            className="block rounded border px-4 py-2 text-sm font-semibold sm:hidden"
            onClick={handleToggle}
         >
            Filter
         </button>

         {/* Fullscreen overlay */}
         {isOpen && (
            <div className="fixed inset-0 z-50 flex flex-col bg-white">
               {/* Header with "Filters" text and close icon */}
               <div className="flex items-center justify-between border-b p-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide">Filters</h2>
                  <button onClick={handleToggle} aria-label="Close Filters">
                     <XMarkIcon className="h-6 w-6" />
                  </button>
               </div>

               {/* Scrollable content area for all your filter categories */}
               <div className="flex-1 overflow-y-auto p-4">
                  {/* Example categories. Replace with your real filter UI. */}
                  <div className="mb-6">
                     <h3 className="mb-2 text-sm font-semibold uppercase">Size</h3>
                     <div className="flex flex-wrap gap-2">
                        {/* Map over your size options. Hard-coded example: */}
                        {['24', '25', '26', '27', '28', '29'].map((size) => (
                           <button
                              key={size}
                              className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white"
                           >
                              {size}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="mb-6">
                     <h3 className="mb-2 text-sm font-semibold uppercase">Colour</h3>
                     <div className="flex flex-wrap gap-2">
                        {/* Hard-coded example: */}
                        {['White', 'Black', 'Blue', 'Grey', 'Green'].map((color) => (
                           <button
                              key={color}
                              className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white"
                           >
                              {color}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="mb-6">
                     <h3 className="mb-2 text-sm font-semibold uppercase">Rise</h3>
                     <div className="flex flex-wrap gap-2">
                        {['Low', 'Mid', 'High'].map((rise) => (
                           <button
                              key={rise}
                              className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white"
                           >
                              {rise}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* ...Repeat for Fabric, Stretch, Length, etc. */}
               </div>

               {/* Footer or “Apply Filters” button (optional) */}
               <div className="border-t p-4">
                  <button
                     className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
                     onClick={handleToggle}
                  >
                     Apply Filters
                  </button>
               </div>
            </div>
         )}
      </>
   );
};

export default MobileFilterOverlay;
