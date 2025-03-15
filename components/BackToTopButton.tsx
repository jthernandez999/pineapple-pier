'use client';

import { ArrowUpCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export default function BackToTopButton() {
   const [isVisible, setIsVisible] = useState(false);

   const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
         setIsVisible(true);
      } else {
         setIsVisible(false);
      }
   };

   const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   useEffect(() => {
      window.addEventListener('scroll', toggleVisibility);
      return () => window.removeEventListener('scroll', toggleVisibility);
   }, []);

   return (
      <div className="fixed bottom-8 right-8 z-50">
         {isVisible && (
            <button
               onClick={scrollToTop}
               aria-label="Back to top"
               className="flex items-center justify-center rounded-full bg-black bg-opacity-80 p-3 text-white shadow-md backdrop-blur-sm transition-transform duration-300 hover:scale-105"
            >
               <ArrowUpCircleIcon className="h-6 w-6" />
            </button>
         )}
      </div>
   );
}
