'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface CollectionImage {
   image: string;
   title: string;
   buttonLink: string;
}

interface CollectionImageProps {
   collectionImages: CollectionImage[];
}

/**
 * A tiny custom hook for intersection-based triggers.
 * We observe the element and set `inView` to true once it enters the viewport.
 */
function useInView(threshold = 0.1) {
   const [inView, setInView] = useState(false);
   const ref = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
         ([entry]) => {
            setInView(entry.isIntersecting);
         },
         { threshold }
      );

      observer.observe(ref.current);
      return () => observer.disconnect();
   }, [threshold]);

   return { ref, inView };
}

export default function ThreeCollections({ collectionImages }: CollectionImageProps) {
   const [isLoading, setIsLoading] = useState(true);
   const [isMobile, setIsMobile] = useState(false);

   // Check whether we're on mobile or not, because we absolutely must.
   useEffect(() => {
      const updateIsMobile = () => {
         setIsMobile(window.innerWidth < 768);
      };
      updateIsMobile(); // check on mount
      window.addEventListener('resize', updateIsMobile);
      return () => window.removeEventListener('resize', updateIsMobile);
   }, []);

   // We’ll politely assume you only have 5 images total.
   const topImages = collectionImages.slice(0, 3);
   const bottomImages = collectionImages.slice(3, 5);

   /**
    * Renders a single image with the IntersectionObserver-based zoom effect.
    * The objectPosition logic is removed here for brevity, but you can re-add
    * it if you want each image to have a special alignment (top, center, bottom).
    */
   const renderImage = (image: CollectionImage, key: string) => {
      const { ref, inView } = useInView(0.15);

      return (
         <div ref={ref} key={key} className="relative aspect-[2/3] w-full overflow-hidden">
            <Link href={image.buttonLink} className="relative block h-full">
               <Image
                  unoptimized
                  src={image.image}
                  alt={`Image ${key}`}
                  fill
                  onLoad={() => setIsLoading(false)}
                  className={` ${!isLoading && inView ? 'scale-100' : 'scale-110'} ease-custom object-cover shadow-md transition-all duration-1200 hover:scale-[.99]`}
               />
               <h3 className="font-regular absolute bottom-0 left-0 w-full p-2 text-4xl text-white">
                  {image.title}
               </h3>
            </Link>
         </div>
      );
   };

   // If it’s mobile, each image is in its own beloved <section>.
   if (isMobile) {
      return (
         <div className="mx-auto w-full overflow-hidden bg-white p-4">
            {collectionImages.map((image, index) => (
               <section key={`mobile-${index}`} className="mb-6">
                  {renderImage(image, `mobile-${index}`)}
               </section>
            ))}
         </div>
      );
   }

   // On desktop, we do the fancy 3 + 2 layout, each row in its own <section>.
   return (
      <div className="mx-auto w-full overflow-hidden bg-white p-4">
         {/* Top row: 3 images */}
         <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {topImages.map((image, index) => renderImage(image, `top-${index}`))}
         </section>

         {/* Bottom row: 2 images */}
         <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {bottomImages.map((image, index) => renderImage(image, `bottom-${index}`))}
         </section>
      </div>
   );
}
