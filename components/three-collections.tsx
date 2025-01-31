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
    <div className="flex flex-col md:flex-row justify-center gap-4 bg-white p-4 h-[100vh] w-[100vw] md:h-auto]">
      {collectionImages.map((image, index) => (
        <div
          key={index}
          className="relative w-full md:w-[calc(33.333% - 16px)] h-full md:h-auto aspect-w-4 aspect-h-5"
        >
          <Link href={image.buttonLink} className="relative block h-full">
            <Image
              src={image.image}
              alt={`Image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-md"
            />
            <h3 className="absolute bottom-0 left-0 p-2 text-lg font-semibold text-white bg-black bg-opacity-50 w-full">
              {image.title}
            </h3>
          </Link>
        </div>
      ))}
    </div>
  );
}
