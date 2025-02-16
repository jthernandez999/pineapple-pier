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
   const touchStartX = useRef<number | null>(null);
   const touchEndX = useRef<number | null>(null);
   const bannerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, interval);
      return () => clearInterval(timer);
   }, [banners.length, interval]);

   // Handle swipe gestures (touch and mouse events)
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
      // Outer container now uses h-screen for full viewport height.
      <div className="relative h-screen w-full overflow-hidden">
         {/* Inner section fills the container. */}
         <section
            className="relative h-full w-full overflow-hidden"
            ref={bannerRef}
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
                        src={banner.image}
                        alt={banner.title || 'Banner'}
                        priority={index === 0}
                        fill
                        style={{
                           objectFit: 'cover',
                           objectPosition: 'center'
                        }}
                        onLoad={() => setIsLoading(false)}
                        className={`${
                           isLoading ? 'scale-110' : 'scale-100'
                        } duration-1200 ease-custom transition-transform`}
                     />
                  </div>
                  {/* Mobile Image */}
                  <div className="m-auto aspect-square md:hidden">
                     <Image
                        src={banner.mobileImage || banner.image}
                        alt={banner.title || 'Banner'}
                        priority={index === 0}
                        fill
                        style={{
                           objectFit: 'cover',
                           objectPosition: 'center'
                        }}
                        onLoad={() => setIsLoading(false)}
                        className={`${
                           isLoading ? 'scale-110' : 'scale-100'
                        } duration-1200 ease-custom transition-transform`}
                     />
                  </div>

                  <div className="bg-black/01 absolute inset-0"></div>

                  <div className="relative z-10 p-4 text-center text-white">
                     {banner.title && (
                        <h2 className="text-xl font-bold md:text-3xl">{banner.title}</h2>
                     )}
                     {banner.description && (
                        <p className="text-sm md:text-lg">{banner.description}</p>
                     )}
                     {banner.buttonText && banner.buttonLink && (
                        <Link
                           href={banner.buttonLink}
                           className="ease-custom z-20 mt-4 inline-block bg-white px-6 py-2 text-sm font-medium text-black transition-all duration-1000 ease-in-out hover:scale-95"
                        >
                           {banner.buttonText}
                        </Link>
                     )}
                  </div>
               </div>
            ))}

            {/* Navigation Arrows */}
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
