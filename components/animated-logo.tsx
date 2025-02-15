'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AnimatedLogo() {
   const pathname = usePathname();
   const isHome = pathname === '/';
   const scrolled = useScrolled(999);

   if (isHome) {
      if (!scrolled) {
         // On the homepage when not scrolled: display the white logo overlay.
         // Rendered inside a relatively positioned hero container.
         return (
            <div className="z-999 pointer-events-none absolute left-1/2 top-1/4 h-[60vh] w-[80vw] -translate-x-1/2 transform md:w-[999vw]">
               <Image
                  src="/dj_white_logo.png"
                  alt="DJ White Logo"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  priority
               />
            </div>
         );
      } else {
         // On the homepage when scrolled: display the black logo in the navbar.
         return (
            <Link
               href="/"
               className="z-999 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform md:left-0 md:ml-4 md:-translate-x-0"
            >
               <div className="relative h-64 w-64">
                  <Image
                     src="/dj_black_logo.png"
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
         <Link
            href="/"
            className="z-999 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform md:left-0 md:ml-4 md:-translate-x-0"
         >
            <div className="relative h-64 w-64">
               <Image
                  src="/dj_black_logo.png"
                  alt="DJ Black Logo"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
               />
            </div>
         </Link>
      );
   }
}

// Custom hook to detect if the window has scrolled past a threshold.
function useScrolled(threshold: number = 999) {
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > threshold);
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
   }, [threshold]);

   return scrolled;
}
