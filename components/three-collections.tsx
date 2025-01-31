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
    <div className="flex aspect-auto h-[50vh] w-[100vw] min-h-max flex-col justify-center gap-4 bg-white p-4 sm:aspect-square md:h-[100vh] md:flex-row">
      {collectionImages.map((image, index) => (
        <div key={index} className="aspect-w-4 aspect-h-5 relative h-full w-full min-h-max">
          <Link href={image.buttonLink} className="relative block h-[100%]">
            <Image
              className='py-auto h-full w-full rounded-md shadow-md aspect-auto'
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
