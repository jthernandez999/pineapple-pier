'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
         // Render this inside a relatively positioned hero container.
         return (
            <div className="pointer-events-none absolute left-1/2 top-1/4 z-[999] h-[60vh] w-[80vw] -translate-x-1/2 transform md:w-[100vw]">
               <Image
                  src="/dj_white_logo.png"
                  alt="DJ White Logo"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  priority
                  unoptimized
               />
            </div>
         );
      } else {
         // On the homepage when scrolled: display the black logo in the navbar.
         // On mobile, center the logo; on desktop, align it to the left.
         return (
            <Link
               href="/"
               className="absolute left-1/2 top-1/2 z-[999] ml-0 -translate-x-1/2 -translate-y-1/2 transform md:left-0 md:ml-4 md:-translate-x-0"
            >
               <div className="relative h-64 w-64">
                  <Image
                     src="/dj_black_logo.png"
                     alt="DJ Black Logo"
                     fill
                     style={{ objectFit: 'contain', objectPosition: 'center' }}
                     unoptimized
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
            className="absolute left-1/2 top-1/2 z-[999] ml-0 -translate-x-1/2 -translate-y-1/2 transform md:left-0 md:ml-4 md:-translate-x-0"
         >
            <div className="relative h-64 w-64">
               <Image
                  src="/dj_black_logo.png"
                  alt="DJ Black Logo"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  unoptimized
               />
            </div>
         </Link>
      );
   }
}
