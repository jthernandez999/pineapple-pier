'use client';

import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dj_white_logo from '../assets/dj_white_logo.png';

// Custom hook to detect if the window has scrolled past a threshold.
function useScrolled(threshold: number = 100) {
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      const onScroll = () => {
         setScrolled(window.scrollY > threshold);
      };

      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
   }, [threshold]);

   return scrolled;
}

export default function AnimatedLogo() {
   // Hide the animated logo on collection pages.
   const pathname = usePathname();
   if (
      pathname.startsWith('/collections') ||
      pathname.startsWith('/product') ||
      pathname.startsWith('/page') ||
      pathname.startsWith('/search') ||
      pathname.startsWith('/cart')
   ) {
      return null;
   }

   const scrolled = useScrolled(100);

   if (!scrolled) {
      // When not scrolled, display the white logo overlay.
      return (
         <div className="pointer-events-none absolute left-1/2 top-1/4 z-50 h-[60vh] w-[80vw] -translate-x-1/2 transform md:w-[100vw]">
            <NextImage
               src={dj_white_logo}
               alt="DJ White Logo"
               fill
               style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
         </div>
      );
   }

   // When scrolled, display the drop-in placeholder text.
   return (
      <div className="relative z-50 ml-4">
         <div className="animate-dropIn text-lg font-bold text-black">Dear John Denim</div>
      </div>
   );
}
