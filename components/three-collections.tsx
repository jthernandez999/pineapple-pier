'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CollectionImage {
   image: string;
   title: string;
   buttonLink: string;
}

interface CollectionImageProps {
   collectionImages: CollectionImage[];
}

export default function ThreeCollections({ collectionImages }: CollectionImageProps) {
   const [isLoading, setIsLoading] = useState(true);

   // Split your precious images: first 3 for the top row, next 2 for the bottom row
   const topImages = collectionImages.slice(0, 3);
   const bottomImages = collectionImages.slice(3, 5);

   // Helper to render each image cell
   const renderImage = (image: CollectionImage, key: string, objectPosition: string) => (
      <div key={key} className="relative aspect-[2/3] w-full overflow-hidden">
         <Link href={image.buttonLink} className="relative block h-full">
            <Image
               unoptimized
               src={image.image}
               alt={`Image ${key}`}
               fill
               onLoad={() => setIsLoading(false)}
               className={`${isLoading ? 'scale-110' : 'scale-100'} ease-custom object-cover transition-all duration-1200 hover:scale-[.99] ${objectPosition} shadow-md`}
            />
            <h3 className="absolute bottom-0 left-0 w-full p-2 text-lg font-semibold text-white">
               {image.title}
            </h3>
         </Link>
      </div>
   );

   // For each row, determine object position: first image at top, last image at bottom, middle centered
   const getObjectPosition = (index: number, total: number) => {
      if (index === 0) return 'object-top';
      if (index === total - 1) return 'object-bottom';
      return 'object-center';
   };

   return (
      <div className="m-auto w-full overflow-hidden bg-white p-4">
         {/* Top row: 3 images */}
         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {topImages.map((image, index) =>
               renderImage(image, `top-${index}`, getObjectPosition(index, topImages.length))
            )}
         </div>
         {/* Bottom row: 2 images */}
         <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {bottomImages.map((image, index) =>
               renderImage(image, `bottom-${index}`, getObjectPosition(index, bottomImages.length))
            )}
         </div>
      </div>
   );
}
