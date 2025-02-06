'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GridTileImage } from 'components/grid/tile';
import { useProduct, useUpdateURL } from 'components/product/product-context';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
   const { state, updateImage } = useProduct();
   const updateURL = useUpdateURL();
   const sliderRef = useRef<Slider>(null);

   // Normalize string: trim, uppercase, remove spaces and hyphens.
   const normalize = (s: string) => s.trim().toUpperCase().replace(/[\s-]/g, '');

   const selectedColor = state.color ? normalize(state.color) : '';

   // Filter images based on altText’s first segment.
   const filteredImages = selectedColor
      ? images.filter((img) => {
           const parts = img.altText.split('-');
           return parts.length > 0 && normalize(parts[0] as string) === selectedColor;
        })
      : images;

   const effectiveImages = filteredImages.length > 0 ? filteredImages : images;
   const imageIndex = state.image ? parseInt(state.image) : 0;

   const nextImageIndex = imageIndex + 1 < effectiveImages.length ? imageIndex + 1 : 0;
   const previousImageIndex = imageIndex === 0 ? effectiveImages.length - 1 : imageIndex - 1;

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

   useEffect(() => {
      sliderRef.current?.slickGoTo(imageIndex);
   }, [imageIndex]);

   console.log('Gallery state:', state);
   console.log('Selected color:', selectedColor);
   console.log('Effective images count:', effectiveImages.length);

   return (
      <form>
         <div className="relative mt-0 h-full w-full overflow-hidden pt-0">
            {/* Mobile Layout */}
            <div className="md:hidden">
               <Slider key={selectedColor} ref={sliderRef} {...settings}>
                  {effectiveImages.map((image, idx) => (
                     <div key={idx} className="relative h-[70vh] w-screen">
                        <Image
                           className="object-fit h-full w-full object-cover"
                           alt={image.altText}
                           src={image.src}
                           fill
                        />
                     </div>
                  ))}
               </Slider>
            </div>
            {/* Desktop Layout */}
            <div className="hidden w-[50vw] md:block">
               <div>
                  <div className="relative h-[100vh] w-full">
                     <figure className="relative h-full w-full 2xl:h-full">
                        <Image
                           src={images[imageIndex]?.src as string}
                           alt={images[imageIndex]?.altText as string}
                           fill
                           sizes="100vw"
                           className="object-contain"
                           priority={true} // Main image gets the VIP treatment
                        />
                     </figure>
                  </div>

                  {/* 2x2 grid of smaller images */}
                  {/* <div className="grid w-full grid-cols-2 flex-wrap gap-5"> */}
                  <div className="grid grid-flow-col grid-cols-2 gap-4 pt-4 md:grid-flow-row">
                     {images.slice(imageIndex + 1, imageIndex + 5).map((img, idx) => (
                        <div key={idx} className="relative h-[55vh] w-full">
                           <figure className="relative h-full w-full">
                              <Image
                                 src={img.src as string}
                                 alt={img.altText as string}
                                 fill
                                 sizes="50vw"
                                 className="object-cover"
                                 priority={false}
                              />
                           </figure>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            {effectiveImages.length > 1 && (
               <div className="absolute bottom-[15%] flex w-full justify-center md:hidden">
                  <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-neutral-50/80 text-neutral-500 backdrop-blur dark:border-black dark:bg-neutral-900/80">
                     <button
                        onClick={(event) => {
                           event.preventDefault();
                           const newState = updateImage(previousImageIndex.toString());
                           updateURL(newState);
                        }}
                        aria-label="Previous product image"
                        className={buttonClassName}
                     >
                        <ArrowLeftIcon className="h-5" />
                     </button>
                     <button
                        onClick={(event) => {
                           event.preventDefault();
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
            )}
            {effectiveImages.length > 1 && (
               <ul className="my-0 flex flex-wrap items-center justify-center gap-0 overflow-auto py-0 md:hidden lg:mb-0">
                  {effectiveImages.map((image, index) => {
                     const isActive = index === imageIndex;
                     return (
                        <li key={image.src} className="h-20 w-20">
                           <button
                              onClick={(event) => {
                                 event.preventDefault();
                                 const newState = updateImage(index.toString());
                                 updateURL(newState);
                              }}
                              aria-label="Select product image"
                              className="h-full w-full"
                           >
                              <GridTileImage
                                 alt={image.altText}
                                 src={image.src}
                                 width={75}
                                 height={75}
                                 active={isActive}
                              />
                           </button>
                        </li>
                     );
                  })}
               </ul>
            )}
         </div>
      </form>
   );
}
