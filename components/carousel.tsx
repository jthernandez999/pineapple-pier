import Link from 'next/link';
import { Product } from '../lib/shopify/types';
import { GridTileImage } from './grid/tile';

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

export function Carousel({ data }: CarouselProps) {
   // Extract the products array from the data object.
   const { products } = data;
   if (!products || products.length === 0) return null;

   // Duplicate products to make the carousel loop.
   const carouselProducts = [...products, ...products, ...products];

   return (
      <div className="h-full w-full overflow-x-auto">
         <ul className="flex animate-carousel gap-4">
            {carouselProducts.map((product, i) => (
               <li
                  key={`${product.handle}${i}`}
                  className="relative aspect-[2/3] w-[66.67vw] flex-none sm:aspect-[2/3] sm:w-[20vw] md:w-[20vw] lg:w-[20vw] xl:w-[20vw] 2xl:w-[20vw]"
               >
                  <Link href={`/product/${product.handle}`} className="relative h-full w-full">
                     <GridTileImage
                        alt={product.title}
                        label={{
                           title: product.title,
                           amount: product.priceRange.maxVariantPrice.amount,
                           currencyCode: product.priceRange.maxVariantPrice.currencyCode
                        }}
                        src={product.featuredImage?.url}
                        secondarySrc={product.images[1]?.url}
                        fill
                        sizes="100vw, (min-width: 768px) 20vw"
                        className="object-cover"
                     />
                  </Link>
               </li>
            ))}
         </ul>
      </div>
   );
}
