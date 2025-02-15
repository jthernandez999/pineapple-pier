'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dj_white_logo from '../assets/dj_white_logo.png';

// Custom hook to detect if the window has scrolled past a threshold.
function useScrolled(threshold: number = 100) {
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > threshold);
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
   }, [threshold]);

   return scrolled;
}

export default function AnimatedLogo() {
   const pathname = usePathname();
   const isHome = pathname === '/';
   const scrolled = useScrolled(100);

   if (isHome) {
      // On the homepage:
      if (!scrolled) {
         // When not scrolled, display the white logo overlay.
         // IMPORTANT: This overlay should be rendered within the hero container (which is relative).
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
      } else {
         // When scrolled on the homepage, display the drop-in placeholder text (navbar version).
         return (
            <Link href="/" className="absolute left-0 top-1/2 z-50 ml-4 -translate-y-1/2 transform">
               <div className="animate-dropIn text-lg font-bold text-black">Dear John Denim</div>
            </Link>
         );
      }
   } else {
      // On other pages, always show the navbar version.
      return (
         <Link href="/" className="absolute left-0 top-1/2 z-50 ml-4 -translate-y-1/2 transform">
            <div className="animate-dropIn text-lg font-bold text-black">Dear John Denim</div>
         </Link>
      );
   }
}
