'use client';
import { dynamicMetaobjectId, getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { Product } from '../lib/shopify/types';
import { GridTileImage } from './grid/tile';
import Label from './label';

export interface CarouselData {
   products: Product[];
   pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
   };
}

export interface CarouselProps {
   data: CarouselData;
}

const NextArrow = (props: any) => {
   const { className, style, onClick } = props;
   return (
      <div
         className={`${className} slick-arrow`}
         style={{
            ...style,
            display: 'block',
            right: '10px',
            zIndex: 10
         }}
         onClick={onClick}
         aria-label="Next Slide"
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
         >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
         </svg>
      </div>
   );
};

const PrevArrow = (props: any) => {
   const { className, style, onClick } = props;
   return (
      <div
         className={`${className} slick-arrow`}
         style={{
            ...style,
            display: 'block',
            left: '10px',
            zIndex: 10
         }}
         onClick={onClick}
         aria-label="Previous Slide"
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
         >
            <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={1}
               d="M15 19l-7-7 7-7"
            />
         </svg>
      </div>
   );
};

export function Carousel({ data }: CarouselProps) {
   const { products } = data;
   if (!products || products.length === 0) return null;

   const settings = {
      infinite: true,
      slidesToShow: 5, // 4 full products plus half of the next one
      slidesToScroll: 1,
      arrows: true,
      swipe: true,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      responsive: [
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: 4.5
            }
         },
         {
            breakpoint: 768,
            settings: {
               slidesToShow: 2.5
            }
         },
         {
            breakpoint: 480,
            settings: {
               slidesToShow: 1.5
            }
         }
      ]
   };

   return (
      <div className="relative">
         <Slider {...settings}>
            {products.map((product, i) => (
               <div key={`${product.handle}${i}`} className="px-2">
                  <Link href={`/products/${product.handle}`} className="block">
                     <div className="relative aspect-[2/3]">
                        <GridTileImage
                           alt={product.title}
                           src={product.featuredImage?.url}
                           secondarySrc={product.images[1]?.url}
                           fill
                           sizes="100vw, (min-width: 768px) 20vw"
                           className="object-cover"
                           swatchMetaobjectId={dynamicMetaobjectId(product)}
                           swatchFallbackColor={product.options
                              ?.find((o) => o.name.toLowerCase() === 'color')
                              ?.values[0]?.toLowerCase()}
                        />
                     </div>
                     <div className="mt-2">
                        <Label
                           title={product.title}
                           amount={product.priceRange.maxVariantPrice.amount}
                           currencyCode={product.priceRange.maxVariantPrice.currencyCode}
                           colorName={
                              product.options?.find((o) => o.name.toLowerCase() === 'color')
                                 ?.values[0]
                           }
                           metaobjectId={getColorPatternMetaobjectId(product)}
                           fallbackColor={product.options
                              ?.find((o) => o.name.toLowerCase() === 'color')
                              ?.values[0]?.toLowerCase()}
                           position="bottom"
                        />
                     </div>
                  </Link>
               </div>
            ))}
         </Slider>
         <style>{`
            .slick-prev:before,
            .slick-next:before {
               display: none !important;
            }
         `}</style>
      </div>
   );
}
