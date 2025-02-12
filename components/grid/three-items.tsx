import { GridTileImage } from 'components/grid/tile';
import { getCollectionProducts } from 'lib/shopify';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';

function ThreeItemGridItem({
   item,
   size,
   priority
}: {
   item: Product;
   size: 'full' | 'half';
   priority?: boolean;
}) {
   return (
      <div
         className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
      >
         <Link
            className="relative block aspect-square h-full w-full"
            href={`/product/${item.handle}`}
            prefetch={true}
         >
            <GridTileImage
               src={item.featuredImage.url}
               secondarySrc={item.images[1]?.url}
               fill
               sizes={
                  size === 'full'
                     ? '(min-width: 768px) 66vw, 100vw'
                     : '(min-width: 768px) 33vw, 100vw'
               }
               priority={priority}
               alt={item.title}
               label={{
                  position: size === 'full' ? 'center' : 'bottom',
                  title: item.title as string,
                  amount: item.priceRange.maxVariantPrice.amount,
                  currencyCode: item.priceRange.maxVariantPrice.currencyCode
               }}
            />
         </Link>
      </div>
   );
}

export async function ThreeItemGrid() {
   // Destructure the products from the returned object.
   const { products: homepageItems } = await getCollectionProducts({
      collection: 'shop-new-arrivals'
   });

   // Check that we have at least three items.
   if (homepageItems.length < 3) return null;

   // Now use non-null assertions (the ! operator) to tell TypeScript these items exist.
   const firstProduct = homepageItems[0]!;
   const secondProduct = homepageItems[1]!;
   const thirdProduct = homepageItems[2]!;

   return (
      <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
         <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
         <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
         <ThreeItemGridItem size="half" item={thirdProduct} />
      </section>
   );
}
