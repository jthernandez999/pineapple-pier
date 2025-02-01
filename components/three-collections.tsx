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
    <div className="w-full overflow-hidden bg-white p-4 md:h-screen md:flex-row">
      <div className="flex flex-col gap-4">
        {collectionImages.map((image, index) => {
          // Determine the object position based on the image's position in the array
          const objectPosition =
            index === 0
              ? 'object-top'
              : index === collectionImages.length - 1
                ? 'object-bottom'
                : 'object-center';

          return (
            <div key={index} className="md:aspect-w-4 md:aspect-h-5 relative aspect-square w-full">
              <Link href={image.buttonLink} className="relative block h-full">
                <Image
                  className={`object-cover ${objectPosition} h-full w-full rounded-md shadow-md sm:object-cover md:rounded-none md:object-cover`}
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
