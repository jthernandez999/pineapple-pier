'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';

function useScrolled(threshold: number = 1) {
   const pathname = usePathname();
   const [scrolled, setScrolled] = useState(false);

   // Reset when navigating back home
   useEffect(() => {
      if (pathname === '/') {
         setScrolled(false);
      }
   }, [pathname]);

   // Immediate scroll listener before paint
   useLayoutEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > threshold);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // initialize in case we're mid‑page
      return () => window.removeEventListener('scroll', onScroll);
   }, [threshold]);

   return scrolled;
}

export default function AnimatedLogo() {
   const pathname = usePathname();
   const isHome = pathname === '/';
   const scrolled = useScrolled(1);

   // Position & scale when not scrolled on homepage
   const notScrolledClasses = `
    left-1/2 -translate-x-1/2 translate-y-[8rem] scale-[2]
    md:translate-y-[15rem] md:scale-[1.9]
    lg:translate-y-[15rem] lg:scale-[2.2]
    xl:translate-y-[15rem] xl:scale-[2.5]
    2xl:translate-y-[10rem] 2xl:scale-[3.2]
  `;

   // Position when scrolled or on other pages
   const scrolledMobile = `
    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
    md:-translate-y-1/2 scale-[.8]
  `;
   const scrolledDesktop = `
    md:hidden lg:hidden
    xl:block xl:ml-4 xl:-translate-x-0
    xl:top-1/2 xl:-translate-y-1/2 xl:-left-[13rem] scale-[.4]
    2xl:ml-0 2xl:pl-0 2xl:-left-[8.5rem] 2xl:scale-[.4] xl:scale-[.2]
  `;

   const containerClasses =
      isHome && !scrolled ? notScrolledClasses : `${scrolledMobile} ${scrolledDesktop}`;

   const scaleClasses =
      isHome && !scrolled
         ? 'scale-[2] md:scale-[2] xl:scale-[2.5] 2xl:scale-[3.5] 3xl:scale-[4]'
         : 'scale-100';

   const imageSrc = isHome && !scrolled ? '/dj_white_logo.png' : '/dj_black_logo.png';

   // **Slowed to 1000ms** for a gentle transition
   const transitionClasses = 'transition-all duration-1000 ease-in-out';

   return (
      <div className={`absolute ${containerClasses} ${scaleClasses} ${transitionClasses}`}>
         <Image
            draggable={false}
            src={imageSrc}
            alt="DJ Logo"
            width={500}
            height={200}
            className="object-contain object-center"
            unoptimized
            priority
         />
      </div>
   );
}
