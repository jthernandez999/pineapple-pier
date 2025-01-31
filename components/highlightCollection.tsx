'use client'

import Image from 'next/image';
import type { FC } from 'react';
import { useState } from 'react';



interface highlightCollectionProps {
    highlightCollectionImages: {
        title?: string;
        description?: string;
        image: string;
        video?: string;
        mobileImage?: string;
        mobileVideo?: string;
        buttonText?: string;
        buttonLink?: string;
    }[];
}

const HighlightCollection: FC<highlightCollectionProps> = ({ highlightCollectionImages = [] }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-screen w-screen">
      {highlightCollectionImages?.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
          style={{ display: 'grid', placeItems: 'center' }}
        >
          {/* Desktop Media */}
          <div className="hidden md:block">
            {banner.video ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                // priority={index === 0}
                // fill
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              >
                <source src={banner.video} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={banner.image}
                alt={banner.title || 'Banner'}
                priority={index === 0}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onLoad={() => setIsLoading(false)}
                className={`${isLoading ? 'scale-110 blur-2xl' : 'scale-100 blur-none'} transition-all duration-700 ease-in-out`}
              />
            )}
          </div>
          {/* Mobile Media */}
          <div className="block md:hidden">
            {banner.mobileVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                // priority={index === 1}
                // fill
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              >
                <source src={banner.mobileVideo || banner.video} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={banner.mobileImage || banner.image} // Fallback to desktop image if mobile image not specified
                alt={banner.title || 'Banner'}
                priority={index === 0}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onLoad={() => setIsLoading(false)}
                className={`${isLoading ? 'scale-110 blur-2xl' : 'scale-100 blur-none'} transition-all duration-700 ease-in-out`}
              />
            )}
          </div>

          <div className="absolute inset-0 bg-black/10"></div>

          <div className="relative z-10 p-4 text-center text-white">
            {banner.title && <h2 className="text-xl font-bold md:text-3xl">{banner.title}</h2>}
            {banner.description && <p className="text-sm md:text-lg">{banner.description}</p>}
            {banner.buttonText && banner.buttonLink && (
              <a
                href={banner.buttonLink}
                className="mt-4 inline-block rounded bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-200"
              >
                {banner.buttonText}
              </a>
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 right-4 flex gap-3">
        {highlightCollectionImages?.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`h-3 w-3 rounded-full ${index === currentBanner ? 'bg-white shadow-lg' : 'bg-gray-400 hover:bg-white'} transition-scale duration-300`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HighlightCollection;
