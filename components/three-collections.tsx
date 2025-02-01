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

export default function ThreeImageCollections({ collectionImages }: CollectionImageProps) {
  return (
    <div className="flex h-screen w-full flex-col justify-center gap-4 overflow-hidden bg-white p-4 sm:aspect-square md:h-screen md:flex-row">
      {collectionImages.map((image, index) => (
        <div key={index} className="aspect-w-4 aspect-h-5 relative h-full min-h-max w-full">
          <Link href={image.buttonLink} className="relative block h-[100%]">
            <Image
              className="xs:object-cover h-full w-full rounded-md object-cover shadow-md sm:object-cover md:rounded-none md:object-cover md:object-center"
              src={image.image}
              alt={`Image ${index + 1}`}
              fill
            />

            <h3 className="absolute bottom-0 left-0 w-full bg-black bg-opacity-10 p-2 text-lg font-semibold text-white">
              {image.title}
            </h3>
          </Link>
        </div>
      ))}
    </div>
  );
}
