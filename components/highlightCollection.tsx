'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

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

const HighlightCollection: FC<HighlightCollectionProps> = ({ highlightCollectionImages = [] }) => {
   const [currentBanner, setCurrentBanner] = useState(0);
   const [isLoading, setIsLoading] = useState(true);

   /**
    * We'll track whether the user has scrolled beyond 75px.
    * Because obviously that's the perfect threshold for everything in life.
    */
   const [hasScrolled, setHasScrolled] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         // oh, what an advanced algorithm
         if (window.scrollY > 75) {
            setHasScrolled(true);
         } else {
            setHasScrolled(false);
         }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      // Gotta keep that absolute positioning for your fade transitions
      <div className="relative mb-24 mt-1 h-[60vh] w-full overflow-x-hidden p-1 md:h-screen">
         {highlightCollectionImages?.map((banner, index) => (
            <div
               key={index}
               className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentBanner ? 'opacity-100' : 'opacity-0'
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
                        className={` ${
                           // If it's done loading and the user has scrolled, go to scale-100
                           !isLoading && hasScrolled ? 'scale-100' : 'scale-110'
                        } ease-custom transition-transform duration-1200`}
                     >
                        <source src={banner.video} type="video/mp4" />
                     </video>
                  ) : (
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
                        className={` ${
                           !isLoading && hasScrolled ? 'scale-100' : 'scale-110'
                        } ease-custom transition-transform duration-1200`}
                     />
                  )}
               </div>

               {/* Mobile Media */}
               <div className="block md:hidden">
                  {banner.mobileVideo ? (
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
                        className={` ${
                           !isLoading && hasScrolled ? 'scale-100' : 'scale-110'
                        } ease-custom transition-transform duration-1200`}
                     >
                        <source src={banner.mobileVideo || banner.video} type="video/mp4" />
                     </video>
                  ) : (
                     <Image
                        unoptimized
                        src={banner.mobileImage || banner.image}
                        alt={banner.title || 'Banner'}
                        priority={index === 0}
                        fill
                        style={{
                           objectFit: 'cover',
                           objectPosition: 'center'
                        }}
                        onLoad={() => setIsLoading(false)}
                        className={` ${
                           !isLoading && hasScrolled ? 'scale-100' : 'scale-110'
                        } ease-custom transition-transform duration-1200`}
                     />
                  )}
               </div>

               <div className="absolute inset-0 bg-black/10" />

               {/* Text Overlay */}
               <div className="relative z-10 p-4 text-center text-white">
                  {banner.title && (
                     <h2 className="text-xl font-bold md:text-3xl">{banner.title}</h2>
                  )}
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
