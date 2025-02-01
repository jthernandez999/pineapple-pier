'use client';
import Image from 'next/image';
import Link from 'next/link';

interface CollectionImage {
   image: string;
   title: string;
   buttonLink: string;
}

interface CollectionImageProps {
   collectionImages: CollectionImage[];
}

export default function ThreeCollections({ collectionImages }: CollectionImageProps) {
   return (
      <div className="w-full overflow-hidden bg-white p-4 md:h-screen">
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
                           className={`object-cover ${objectPosition} h-full w-full rounded-md shadow-md`}
                           src={image.image}
                           alt={`Image ${index + 1}`}
                           fill
                        />
                        <h3 className="absolute bottom-0 left-0 w-full bg-black bg-opacity-10 p-2 text-lg font-semibold text-white">
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
