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
   return (
      <div className="m-auto w-full overflow-hidden bg-white p-4">
         {/* Use flex-col on mobile and flex-row on desktop */}
         <div className="flex flex-col gap-4 md:flex-row">
            {collectionImages.map((image, index) => {
               const objectPosition =
                  index === 0
                     ? 'object-top'
                     : index === collectionImages.length - 1
                       ? 'object-bottom'
                       : 'object-center';

               return (
                  // Force a 2:3 ratio using aspect-[2/3] and assign each image 100% width on mobile and 1/3 on desktop
                  <div key={index} className="relative aspect-[2/3] w-full md:w-1/3">
                     <Link href={image.buttonLink} className="relative block h-full">
                        <Image
                           onLoad={() => setIsLoading(false)}
                           className={`${
                              isLoading ? 'scale-110' : 'scale-100'
                           } duration-1200 ease-custom object-cover transition-all ease-in-out hover:scale-95 ${objectPosition} h-full w-full shadow-md`}
                           // className={`${
                           //    isLoading ? 'scale-110' : 'scale-100'
                           // } duration-1200 ease-custom object-cover transition-all ease-in-out ${objectPosition} h-full w-full rounded-md shadow-md`}
                           // className={`object-cover ${objectPosition} h-full w-full rounded-md shadow-md`}
                           src={image.image}
                           alt={`Image ${index + 1}`}
                           fill
                        />
                        <h3 className="absolute bottom-0 left-0 w-full p-2 text-lg font-semibold text-white">
                           {image.title}
                        </h3>
                     </Link>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
