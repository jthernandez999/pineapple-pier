import { FC, useState } from 'react';

interface StretchabilitySectionProps {
   stretchTag: string;
}

const StretchabilitySection: FC<StretchabilitySectionProps> = ({ stretchTag }) => {
   // Only display if the stretchTag is either "Stretch" or "Rigid"
   if (stretchTag !== 'Stretch' && stretchTag !== 'Rigid') {
      return null;
   }

   const [isOpen, setIsOpen] = useState(false);

   return (
      <div className="my-6 mb-4 border-b pb-2">
         {/* Toggle button */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between text-left text-lg font-normal text-gray-800 hover:opacity-80"
         >
            <span className="">Stretchability</span>
            {isOpen ? (
               // Minus icon when open
               <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <line
                     x1="5"
                     y1="12"
                     x2="19"
                     y2="12"
                     stroke="currentColor"
                     strokeWidth=".75"
                     strokeLinecap="round"
                  />
               </svg>
            ) : (
               // Plus icon when closed
               <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <line
                     x1="12"
                     y1="5"
                     x2="12"
                     y2="19"
                     stroke="currentColor"
                     strokeWidth=".75"
                     strokeLinecap="round"
                  />
                  <line
                     x1="5"
                     y1="12"
                     x2="19"
                     y2="12"
                     stroke="currentColor"
                     strokeWidth=".75"
                     strokeLinecap="round"
                  />
               </svg>
            )}
         </button>

         {/* Content shown when open */}
         {isOpen && (
            <div className="mt-4">
               <div className="relative mx-auto my-5 flex w-full max-w-[400px] items-center justify-between">
                  {/* Single horizontal line across the center */}
                  <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-black" />

                  {/* Left side (Stretch) */}
                  <div className="relative">
                     {/* Circle pinned at the center */}
                     <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white" />
                     {/* Label below */}
                     <span className="block px-[6] pt-10 text-center text-xs">Stretch</span>
                  </div>

                  {/* Right side (Rigid) */}
                  <div className="relative">
                     {/* Circle pinned at the center */}
                     <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-black" />
                     {/* Label below */}
                     <span className="block px-4 pt-10 text-center text-xs">Rigid</span>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default StretchabilitySection;
