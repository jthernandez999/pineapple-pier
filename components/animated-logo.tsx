'use client';

import Image from 'next/image';
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

   // When not scrolled on the homepage, we want the container to be:
   // - On mobile: centered horizontally, positioned at about 25% from the top.
   // - On desktop: the same, but the inner image scales to 2.5×.
   const notScrolledClasses = 'left-1/2 top-[.001em] -translate-x-1/2 translate-y-[15rem]';
   // When scrolled (or on non-home pages), we want:
   // - On mobile: centered horizontally and vertically.
   // - On desktop: aligned to the left with a margin.
   const scrolledMobile = 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1 md:-translate-y-1/2';
   const scrolledDesktop = 'md:left-0 md:ml-4 md:-translate-x-0';

   // Pick the transform classes based on state:
   const containerClasses =
      isHome && !scrolled ? notScrolledClasses : `${scrolledMobile} ${scrolledDesktop}`;

   // For scaling:
   // When not scrolled on homepage, on desktop we scale up by 2.5x; otherwise scale is 1.
   const scaleClasses = isHome && !scrolled ? 'md:scale-[4]' : 'scale-100';

   // The image source: white logo when not scrolled on homepage; black logo otherwise.
   const imageSrc = isHome && !scrolled ? '/dj_white_logo.png' : '/dj_black_logo.png';

   // Use a 3000ms transition for transform changes.
   const transitionClasses = 'transition-all duration-[1100ms] ease-in-out';

   return (
      <div
         // href="/"
         className={`absolute ${containerClasses} ${scaleClasses} ${transitionClasses}`}
      >
         {/* <div className="relative top-[0] z-[40] mx-auto h-[18rem] w-[18rem] sm:h-[22rem] sm:w-[22rem] md:h-80 md:w-80"> */}
         <Image
            draggable={false}
            src={imageSrc}
            alt="DJ Logo"
            width={500}
            height={200}
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            unoptimized
         />
         {/* </div> */}
      </div>
   );
}
