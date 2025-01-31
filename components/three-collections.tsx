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
<div className="flex w-full 2xl:h-[1060px] 2xl:w-[2548px] flex-col justify-center gap-4 bg-white p-4 h-full sm:w-[100vh] xs:w-[100vw] xs:h-[100vh] md:flex-row">
      {collectionImages.map((image, index) => (
        <div key={index} className="relative h-screen 2xl:h-full w-full">
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
            <h3 className="absolute bottom-0 left-0 w-full bg-black bg-opacity-10 p-2 text-lg font-semibold text-white">
              {image.title}
            </h3>
          </Link>
        </div>
      ))}
    </div>
  );
}
