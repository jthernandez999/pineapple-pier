'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface BannerProps {
  banners: {
    image: string; // URL of the banner image
    title?: string; // Optional title text
    description?: string; // Optional description text
    buttonText?: string; // Optional button text
    buttonLink?: string; // Optional button link
  }[];
  interval?: number; // Interval in milliseconds for changing banners
}

export default function HeroBanner({ banners, interval = 4000 }: BannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer); // Cleanup timer on unmount
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
      className="relative w-full"
      ref={bannerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Banner Container */}
      <div className="relative h-0 w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBanner
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${banner.image || ''})`
              }}
            ></div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Content */}
            <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-4 text-center text-white">
              {banner.title && (
                <h2 className="mb-2 text-xl font-bold md:text-3xl">{banner.title || ''}</h2>
              )}
              {banner.description && (
                <p className="mb-4 text-sm md:text-lg">{banner.description || ''}</p>
              )}
              {banner.buttonText && banner.buttonLink && (
                <Link
                  href={banner.buttonLink || '#'}
                  className="inline-block rounded bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-200"
                >
                  {banner.buttonText || 'Learn More'}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 right-4 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === currentBanner
                ? 'scale-125 bg-white shadow-lg'
                : 'bg-gray-400 hover:bg-white'
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
}
