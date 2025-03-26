'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface BannerProps {
   banners: {
      image: string;
      mobileImage?: string;
      title?: string;
      description?: string;
      buttonText?: string;
      buttonLink?: string;
   }[];
   interval?: number;
}

export default function HeroBanner({ banners, interval = 4000 }: BannerProps) {
   const [currentBanner, setCurrentBanner] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [textVisible, setTextVisible] = useState(false);
   const touchStartX = useRef<number | null>(null);
   const touchEndX = useRef<number | null>(null);
   const bannerRef = useRef<HTMLDivElement>(null);

   // Rotate banners automatically.
   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, interval);
      return () => clearInterval(timer);
   }, [banners.length, interval]);

   // Listen to window scroll and reveal text after user scrolls down a bit.
   useEffect(() => {
      const handleScroll = () => {
         if (window.scrollY > 75) {
            setTextVisible(true);
         }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   // Check if mobile by window width.
   const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

   // Handle swipe gestures.
   const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
      if ('touches' in e && e.touches[0]) {
         touchStartX.current = e.touches[0].clientX;
      } else if ('clientX' in e) {
         touchStartX.current = (e as React.MouseEvent).clientX;
      }
   };

   const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
      if ('touches' in e && e.touches[0]) {
         touchEndX.current = e.touches[0].clientX;
      } else if ('clientX' in e) {
         touchEndX.current = (e as React.MouseEvent).clientX;
      }
   };

   const handleTouchEnd = () => {
      if (isMobile) {
         touchStartX.current = null;
         touchEndX.current = null;
         return;
      }
      if (touchStartX.current !== null && touchEndX.current !== null) {
         const deltaX = touchStartX.current - touchEndX.current;
         if (deltaX > 50) {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
         }
         if (deltaX < -50) {
            setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
         }
      }
      touchStartX.current = null;
      touchEndX.current = null;
   };

   return (
      // Outer container uses h-screen for full viewport height.
      <div className="relative h-screen w-full overflow-hidden" ref={bannerRef}>
         {/* Inner section fills the container */}
         <section
            className="relative h-full w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
         >
            {banners.map((banner, index) => (
               <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                     index === currentBanner ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ display: 'grid', placeItems: 'center' }}
               >
                  {/* Desktop Image */}
                  <div className="hidden md:block">
                     <Image
                        priority
                        unoptimized
                        src={banner.image}
                        alt={banner.title || 'Banner'}
                        // priority={index === 0}
                        fill
                        style={{ objectPosition: 'center' }}
                        onLoad={() => setIsLoading(false)}
                        className={`${
                           isLoading ? 'scale-110' : 'scale-100'
                        } ease-custom object-cover transition-transform duration-1200`}
                     />
                  </div>
                  {/* Mobile Image */}
                  <div className="m-auto aspect-square md:hidden">
                     <Image
                        unoptimized
                        src={banner.mobileImage || banner.image}
                        alt={banner.title || 'Banner'}
                        priority
                        // priority={index === 0}
                        fill
                        style={{ objectPosition: 'center' }}
                        onLoad={() => setIsLoading(false)}
                        className={`${
                           isLoading ? 'scale-110' : 'scale-100'
                        } ease-custom object-cover transition-transform duration-1200`}
                     />
                  </div>

                  <div className="bg-black/01 absolute inset-0"></div>

                  <div
                     className={`lg:bottom-45 relative bottom-40 z-[65] transform p-4 text-center text-white transition-transform duration-700 md:bottom-40 ${
                        index === 0
                           ? textVisible
                              ? 'duration-1500 translate-y-0 opacity-100 transition-transform'
                              : 'duration-1500 translate-y-80 opacity-0 transition-transform'
                           : 'opacity-100'
                     }`}
                  >
                     {banner.title && (
                        <h2 className="font-poppins text-4xl font-light tracking-wide md:text-4xl lg:text-6xl xl:text-7xl">
                           {banner.title}
                        </h2>
                     )}
                     {banner.description && (
                        <p className="mt-2 text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                           {banner.description}
                        </p>
                     )}
                     {banner.buttonText && banner.buttonLink && (
                        <Link
                           href={banner.buttonLink}
                           className="duration-1100 mt-4 inline-block border border-white bg-transparent px-6 py-2 text-sm font-medium text-white transition-all ease-in-out hover:scale-95 hover:bg-white hover:text-black md:ml-4 md:-translate-x-0"
                        >
                           {banner.buttonText}
                        </Link>
                     )}
                  </div>
               </div>
            ))}

            {/* Navigation Arrows!! */}
            <div className="absolute bottom-4 right-4 flex gap-3">
               {banners.map((_, index) => (
                  <button
                     key={index}
                     onClick={() => setCurrentBanner(index)}
                     className={`h-3 w-3 ${
                        index === currentBanner
                           ? 'rounded-lg bg-white shadow-lg'
                           : 'bg-gray-400 hover:bg-white'
                     } transition-transform duration-300`}
                  ></button>
               ))}
            </div>
         </section>
      </div>
   );
}
