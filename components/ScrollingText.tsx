import { scrollingTextData } from 'assets';
import Link from 'next/link';
import React from 'react';

const ScrollingText: React.FC = () => {
   const { text, link } = scrollingTextData;
   const repeats = 15; // Duplicate text for continuous scroll

   return (
      <div className="z-[41] w-full overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 py-2">
         <div className="animate-marquee flex whitespace-nowrap">
            {Array.from({ length: repeats }).map((_, i) => (
               <Link
                  key={i}
                  href={link}
                  className="shiny-text mx-6 inline-block text-sm font-normal tracking-widest transition duration-300 hover:opacity-80"
               >
                  {text.toUpperCase()}
               </Link>
            ))}
         </div>
      </div>
   );
};

export default ScrollingText;
