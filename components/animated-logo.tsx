'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function useScrolled(threshold: number = 100) {
   const pathname = usePathname();
   const [scrolled, setScrolled] = useState(false);

   // When navigating back to the homepage, force the default (non-scrolled) state
   useEffect(() => {
      if (pathname === '/') {
         setScrolled(false);
      }
   }, [pathname]);

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

   // When not scrolled on the homepage, we want the container to be:
   // - On mobile: centered horizontally, positioned at about 25% from the top.
   // - On desktop: the same, but the inner image scales to 2.5×.
   const notScrolledClasses =
      'left-1/2 -top-[10em] -translate-x-1/2 translate-y-[15rem] scale-[1] 2xl:scale-[3]';
   // When scrolled (or on non-home pages), we want:
   // - On mobile: centered horizontally and vertically.
   // - On desktop: aligned to the left with a margin.
   const scrolledMobile = 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1 md:-translate-y-1/2';
   const scrolledDesktop =
      'md:hidden lg:hidden xl:block xl:left-[4rem] xl:ml-4 xl:-translate-x-0 xl:top-1/2 xl:-translate-y-1/2  scale-[1.3] xl:scale-[.5]  xl:scale-[.25] xl:-translate-x-[12rem] xl:scale-[.38] xl:-translate-x-[9rem]  2xl:scale-[.5] 2xl:-translate-x-[10.5rem] 2xl:ml-0 2xl:pl-0';

   // Pick the transform classes based on state:
   const containerClasses =
      isHome && !scrolled ? notScrolledClasses : `${scrolledMobile} ${scrolledDesktop}`;

   // For scaling:
   // When not scrolled on homepage, on desktop we scale up by 2.5x; otherwise scale is 1.
   const scaleClasses =
      isHome && !scrolled
         ? 'scale-[2] md:scale-[2] xl:scale-[2.5] 2xl:scale-[3.5] 3xl:scale-[4]'
         : 'scale-100';

   // The image source: white logo when not scrolled on homepage; black logo otherwise.
   const imageSrc = isHome && !scrolled ? '/dj_white_logo.png' : '/dj_black_logo.png';

   // Use a 3000ms transition for transform changes.
   const transitionClasses = 'transition-all duration-[1100ms] ease-in-out';

   return (
      <div className={`absolute ${containerClasses} ${scaleClasses} ${transitionClasses}`}>
         <Image
            draggable={false}
            src={imageSrc}
            alt="DJ Logo"
            width={500}
            height={200}
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            unoptimized
         />
      </div>
   );
}
