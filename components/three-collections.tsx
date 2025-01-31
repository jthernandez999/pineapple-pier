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
    <div className="xs:w-[100vw] xs:h-[100vh] flex h-full w-full flex-col justify-center gap-4 bg-white p-4 sm:w-[100vh] md:flex-row 2xl:h-[1060px] 2xl:w-[2548px]">
      {collectionImages.map((image, index) => (
        <div key={index} className="relative h-screen w-full 2xl:h-full">
          <Link href={image.buttonLink} className="relative block h-[100%]">
            <Image
              src={image.image}
              alt={`Image ${index + 1}`}
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            <h3 className="absolute bottom-2 left-2 w-full bg-black bg-opacity-0 p-2 text-2xl font-semibold uppercase text-white hover:text-gray-300">
              {image.title}
            </h3>
          </Link>
        </div>
      ))}
    </div>
  );
}
