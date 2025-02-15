'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dj_black_logo from '../assets/dj_black_logo.png';
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
      if (!scrolled) {
         // On the homepage when not scrolled: display the white logo overlay.
         // Ensure this is rendered inside a relatively positioned hero container.
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
         // On the homepage when scrolled: display the black logo in the navbar.
         return (
            <Link href="/" className="absolute left-0 top-1/2 z-50 ml-4 -translate-y-1/2 transform">
               <div className="relative h-64 w-64">
                  <NextImage
                     src={dj_black_logo}
                     alt="DJ Black Logo"
                     fill
                     style={{ objectFit: 'contain', objectPosition: 'center' }}
                  />
               </div>
            </Link>
         );
      }
   } else {
      // On non-home pages: always display the black logo in the navbar.
      return (
         <Link href="/" className="absolute left-0 top-1/2 z-50 ml-4 -translate-y-1/2 transform">
            <div className="relative h-64 w-64">
               <NextImage
                  src={dj_black_logo}
                  alt="DJ Black Logo"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
               />
            </div>
         </Link>
      );
   }
}
