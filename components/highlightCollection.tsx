'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

interface HighlightCollectionProps {
   highlightCollectionImages: {
      title?: string;
      description?: string;
      image: string;
      video?: string;
      mobileImage?: string;
      mobileVideo?: string;
      buttonText?: string;
      buttonLink?: string;
   }[];
}

// Because we love over-engineering even the simplest effects, here’s our trusty hook.
function useInView(threshold = 0.1) {
   const [inView, setInView] = useState(false);
   const ref = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (!ref.current) return;
      const observer = new IntersectionObserver(
         (entries) => {
            const entry = entries[0];
            if (!entry) return;
            setInView(entry.isIntersecting);
         },
         { threshold }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
   }, [threshold]);

   return { ref, inView };
}

// Each banner gets its own moment to shine, complete with the zoom effect.
function BannerItem({
   banner,
   isActive,
   isLoading,
   setIsLoading
}: {
   banner: HighlightCollectionProps['highlightCollectionImages'][number];
   isActive: boolean;
   isLoading: boolean;
   setIsLoading: (value: boolean) => void;
}) {
   const { ref, inView } = useInView(0.15);

   return (
      <div
         ref={ref}
         className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            isActive ? 'opacity-100' : 'opacity-0'
         }`}
         style={{ display: 'grid', placeItems: 'center' }}
      >
         {/* Desktop Media */}
         <div className="hidden md:block">
            {banner.video ? (
               <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                     objectFit: 'cover',
                     width: '100%',
                     height: '100%'
                  }}
                  className={`${
                     !isLoading && inView ? 'scale-100' : 'scale-110'
                  } ease-custom transition-transform duration-1200 hover:scale-[.99]`}
               >
                  <source src={banner.video} type="video/mp4" />
               </video>
            ) : (
               <Image
                  unoptimized
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  priority
                  fill
                  style={{
                     objectFit: 'cover',
                     objectPosition: 'center'
                  }}
                  onLoad={() => setIsLoading(false)}
                  className={`${
                     !isLoading && inView ? 'scale-100' : 'scale-110'
                  } ease-custom object-cover transition-transform duration-1200 hover:scale-[.99]`}
               />
            )}
         </div>

         {/* Mobile Media */}
         <div className="mx-auto block aspect-square h-full w-full md:hidden">
            {banner.mobileVideo ? (
               <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                     width: '100%',
                     height: '100%'
                  }}
                  className={`${
                     !isLoading && inView ? 'scale-100' : 'scale-110'
                  } ease-custom transition-transform duration-1200 hover:scale-[.99]`}
               >
                  <source src={banner.mobileVideo || banner.video} type="video/mp4" />
               </video>
            ) : (
               <Image
                  unoptimized
                  src={banner.mobileImage || banner.image}
                  alt={banner.title || 'Banner'}
                  priority
                  fill
                  style={{
                     objectPosition: 'center'
                  }}
                  onLoad={() => setIsLoading(false)}
                  className={`${
                     !isLoading && inView ? 'scale-100' : 'scale-110'
                  } ease-custom aspect-square h-full w-full object-contain transition-transform duration-1200 hover:scale-[.99]`}
               />
            )}
         </div>

         <div className="absolute inset-0 bg-black/10" />

         {/* Text Overlay */}
         <div className="absolute bottom-20 z-10 p-4 text-center text-white md:bottom-20 lg:bottom-52 2xl:bottom-52">
            {banner.title && <h2 className="text-xl font-bold md:text-3xl">{banner.title}</h2>}
            {banner.description && <p className="text-sm md:text-lg">{banner.description}</p>}
            {banner.buttonText && banner.buttonLink && (
               <a
                  href={banner.buttonLink}
                  className="ease-custom mt-4 inline-block bg-white px-6 py-2 text-sm font-medium text-black transition-all duration-1000 ease-in-out hover:scale-95"
               >
                  {banner.buttonText}
               </a>
            )}
         </div>
      </div>
   );
}

const HighlightCollection: FC<HighlightCollectionProps> = ({ highlightCollectionImages = [] }) => {
   const [currentBanner, setCurrentBanner] = useState(0);
   const [isLoading, setIsLoading] = useState(true);

   return (
      <div className="relative mb-24 mt-1 aspect-square h-full w-full overflow-hidden p-1 md:aspect-auto md:h-screen">
         {highlightCollectionImages?.map((banner, index) => (
            <BannerItem
               key={index}
               banner={banner}
               isActive={index === currentBanner}
               isLoading={isLoading}
               setIsLoading={setIsLoading}
            />
         ))}

         {/* Navigation Arrows */}
         <div className="absolute bottom-4 right-4 flex gap-3">
            {highlightCollectionImages?.map((_, index) => (
               <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-3 w-3 ${
                     index === currentBanner
                        ? 'rounded-lg bg-white shadow-lg'
                        : 'bg-gray-400 hover:bg-white'
                  } transition-transform duration-300`}
               />
            ))}
         </div>
      </div>
   );
};

export default HighlightCollection;
