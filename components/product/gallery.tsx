'use client';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GridTileImage } from 'components/grid/tile';
import { useProduct, useUpdateURL } from 'components/product/product-context';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
  const { state, updateImage } = useProduct();
  const updateURL = useUpdateURL();
  const imageIndex = state.image ? parseInt(state.image) : 0;

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  const buttonClassName =
    'h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center';

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  return (
    <form>
      <div className="relative h-full w-full overflow-hidden">
        <div className="md:hidden">
          <Slider {...settings}>
            {images.map((image, idx) => (
              <div key={idx} className="relative h-screen w-screen">
                {' '}
                {/* Ensure the container has height of the screen */}
                <Image
                  className="object-fit h-full w-full object-cover" // Adjusted class names for full coverage
                  fill // Keeps fill layout
                  alt={image.altText}
                  src={image.src}
                />
              </div>
            ))}
          </Slider>
        </div>

        <div className="hidden md:block">
          {/* Existing desktop layout */}
          <div className="flex flex-col md:mb-4 md:flex-row">
            {images.slice(imageIndex, imageIndex + 2).map((image, idx) => (
              <div
                key={idx}
                className="relative aspect-square h-full w-full flex-1 overflow-hidden"
              >
                <Image
                  className="h-full w-full object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={image.altText as string}
                  src={image.src as string}
                  priority={idx === 0} // Priority true for only the first image
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row">
            {images.slice(imageIndex + 2, imageIndex + 4).map((image, idx) => (
              <div
                key={idx + 2}
                className="relative aspect-square h-full w-full flex-1 overflow-hidden"
              >
                <Image
                  className="h-full w-full object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={image.altText as string}
                  src={image.src as string}
                  priority={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation and thumbnail components remain unchanged */}
        {images.length > 1 ? (
          <div className="absolute bottom-[15%] flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-neutral-50/80 text-neutral-500 backdrop-blur dark:border-black dark:bg-neutral-900/80">
              <button
                formAction={() => {
                  const newState = updateImage(previousImageIndex.toString());
                  updateURL(newState);
                }}
                aria-label="Previous product image"
                className={buttonClassName}
              >
                <ArrowLeftIcon className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-neutral-500"></div>
              <button
                formAction={() => {
                  const newState = updateImage(nextImageIndex.toString());
                  updateURL(newState);
                }}
                aria-label="Next product image"
                className={buttonClassName}
              >
                <ArrowRightIcon className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="my-12 flex flex-wrap items-center justify-center gap-2 overflow-auto py-1 lg:mb-0">
          {images.map((image, index) => {
            const isActive = index === imageIndex;

            return (
              <li key={image.src} className="h-20 w-20">
                <button
                  formAction={() => {
                    const newState = updateImage(index.toString());
                    updateURL(newState);
                  }}
                  aria-label="Select product image"
                  className="h-full w-full"
                >
                  <GridTileImage
                    alt={image.altText}
                    src={image.src}
                    width={80}
                    height={80}
                    active={isActive}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
}
