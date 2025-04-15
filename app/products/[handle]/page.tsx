import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GridTileImage } from 'components/grid/tile';
import { ProductProvider } from 'components/product/product-context';
import { ProductDescription } from 'components/product/product-description';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants';
import { getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { getProduct, getProductRecommendations } from 'lib/shopify';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';
import ActiveGallery from '../../../components/ActiveGallery';
import Grid from '../../../components/grid';
import Label from '../../../components/label';

type RouteParams = { handle: string; collection?: string };

const fallbackImg = {
   url: 'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110',
   width: 1000,
   height: 2000,
   altText: 'Default product image'
};

export async function generateMetadata({
   params
}: {
   params: Promise<RouteParams>;
}): Promise<Metadata> {
   const { handle } = await params;
   const product = await getProduct(handle);
   if (!product) return notFound();

   const featuredImage = product.featuredImage || fallbackImg;
   const { url, width, height, altText: alt } = featuredImage;
   const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

   return {
      title: product.seo.title || product.title,
      description: product.seo.description || product.description,
      robots: {
         index: indexable,
         follow: indexable,
         googleBot: {
            index: indexable,
            follow: indexable
         }
      },
      openGraph: url
         ? {
              images: [{ url, width, height, alt }]
           }
         : null
   };
}

async function RelatedProducts({ id }: { id: string }) {
   const relatedProducts = await getProductRecommendations(id);

   if (!relatedProducts.length) return null;

   function flattenImages(images: any): any[] {
      if (!images) return [];
      if (Array.isArray(images)) return images;
      if (images.edges && Array.isArray(images.edges)) {
         return images.edges.map((edge: any) => edge.node);
      }
      return [];
   }

   return (
      <div className="p-8 py-8">
         <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
         <ul className="flex w-full gap-4 overflow-x-auto pt-1">
            {relatedProducts.map((product: Product) => {
               const colorOption = product.options?.find((o) => o.name.toLowerCase() === 'color');
               const colorName = colorOption ? colorOption.values[0] : undefined;
               const fallbackColor = colorName ? colorName.toLowerCase() : '#ccc';

               const rawSwatch = getColorPatternMetaobjectId(product);
               const swatchColor =
                  rawSwatch && rawSwatch.startsWith('#') ? rawSwatch : fallbackColor;

               return (
                  <ul
                     key={product.handle}
                     className="aspect-[2/3] w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
                  >
                     <Grid.Item key={product.handle} className="animate-fadeIn">
                        <Link
                           href={`/products/${product.handle}`}
                           prefetch={true}
                           className="flex h-full w-full flex-col"
                        >
                           <div className="relative aspect-[2/3] w-full">
                              <GridTileImage
                                 alt={product.title}
                                 src={product.featuredImage?.url || fallbackImg.url}
                                 secondarySrc={
                                    flattenImages(product.images)[1]?.url ||
                                    product.featuredImage?.url
                                 }
                                 fill
                                 sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
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
                                 fallbackColor={
                                    product.options
                                       ?.find((o) => o.name.toLowerCase() === 'color')
                                       ?.values[0]?.toLowerCase() || '#FFFFFF'
                                 }
                                 position="bottom"
                              />
                           </div>
                        </Link>
                     </Grid.Item>
                  </ul>
               );
            })}
         </ul>
      </div>
   );
}

export default async function ProductPage({ params }: { params: Promise<RouteParams> }) {
   const { handle, collection } = await params;
   const product = await getProduct(handle);
   if (!product) return notFound();
   const featuredImage = product.featuredImage || fallbackImg;

   const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: featuredImage.url,
      offers: {
         '@type': 'AggregateOffer',
         availability: product.availableForSale
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
         priceCurrency: product.priceRange.minVariantPrice.currencyCode,
         highPrice: product.priceRange.maxVariantPrice.amount,
         lowPrice: product.priceRange.minVariantPrice.amount
      }
   };

   return (
      <ProductProvider initialProduct={product} key={product.id}>
         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
         />
         <div className="mx-auto w-full px-0 md:max-w-[1950px] md:px-4">
            <div className="flex flex-col bg-white p-0 dark:border-neutral-800 dark:bg-black md:p-8 lg:flex-row lg:gap-8">
               {/* Gallery / Main Image */}
               <div className="w-full lg:basis-1/2">
                  <Suspense fallback={<div className="relative h-full w-full overflow-hidden" />}>
                     <ActiveGallery />
                  </Suspense>
               </div>

               {/* Product Description */}
               <div className="w-full lg:basis-1/2">
                  <Suspense fallback={null}>
                     <ProductDescription product={product} />
                  </Suspense>
               </div>
            </div>
            <RelatedProducts id={product.id} />
         </div>
         {/* <Footer /> */}
      </ProductProvider>
   );
}
