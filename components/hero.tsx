'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface BannerProps {
  banners: {
    image: string;
    mobileImage?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  }[];
  interval?: number;
}

export default function HeroBanner({ banners, interval = 4000 }: BannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [banners.length, interval]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Check if `touches` exist and access safely
    if ('touches' in e && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    } else if ('clientX' in e) {
      touchStartX.current = (e as React.MouseEvent).clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    // Check if `touches` exist and access safely
    if ('touches' in e && e.touches[0]) {
      touchEndX.current = e.touches[0].clientX;
    } else if ('clientX' in e) {
      touchEndX.current = (e as React.MouseEvent).clientX;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchStartX.current - touchEndX.current;

      // Swipe left to go to the next banner
      if (deltaX > 50) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }

      // Swipe right to go to the previous banner
      if (deltaX < -50) {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden md:h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)] xl:h-[calc(100vh-112px)] 2xl:h-[calc(100vh-128px)]"
      ref={bannerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
         {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
          style={{ display: 'grid', placeItems: 'center' }}
        >
          {/* Desktop Image */}
          <div className="hidden md:block">
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
          </div>
          {/* Mobile Image */}
          <div className="block md:hidden ">
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
          </div>

          <div className="absolute inset-0 bg-black/01"></div>

          <div className="relative z-10 p-4 text-center text-white">
            {banner.title && <h2 className="text-xl font-bold md:text-3xl">{banner.title}</h2>}
            {banner.description && <p className="text-sm md:text-lg">{banner.description}</p>}
            {banner.buttonText && banner.buttonLink && (
              <Link
                href={banner.buttonLink}
                className="mt-4 inline-block rounded bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-200"
              >
                {banner.buttonText}
              </Link>
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 right-4 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`h-3 w-3 rounded-full ${index === currentBanner ? 'bg-white shadow-lg' : 'bg-gray-400 hover:bg-white'} transition-scale duration-300`}
          ></button>
        ))}
      </div>
      
    </section>
  );
}
