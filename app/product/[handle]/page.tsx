import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GridTileImage } from 'components/grid/tile';
import Footer from 'components/layout/footer';
import { Gallery } from 'components/product/gallery';
import { ProductProvider } from 'components/product/product-context';
import { ProductDescription } from 'components/product/product-description';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants';
import { getProduct, getProductRecommendations } from 'lib/shopify';
import { Image } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';

const fallbackImg = {
   url: 'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110',
   width: 1000,
   height: 2000,
   altText: 'Default product image'
};

export async function generateMetadata(props: {
   params: Promise<{ handle: string }>;
}): Promise<Metadata> {
   const params = await props.params;
   const product = await getProduct(params.handle);

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
              images: [
                 {
                    url,
                    width,
                    height,
                    alt
                 }
              ]
           }
         : null
   };
}

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
   const params = await props.params;
   const product = await getProduct(params.handle);

   if (!product) return notFound();

   // If there's no featured image, use our fallback image.
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
      <ProductProvider>
         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
               __html: JSON.stringify(productJsonLd)
            }}
         />
         <div className="mx-auto w-screen max-w-[1950px] px-0 md:px-4">
            <div className="flex flex-col bg-white p-0 dark:border-neutral-800 dark:bg-black md:p-8 lg:flex-row lg:gap-8">
               {/* Gallery / Main Image */}
               <div className="w-full lg:basis-1/2">
                  <Suspense fallback={<div className="relative h-full w-full overflow-hidden" />}>
                     <Gallery
                        images={
                           product.images && product.images.length
                              ? product.images.slice(0, 5).map((image: Image) => ({
                                   src: image.url,
                                   altText: image.altText
                                }))
                              : [{ src: fallbackImg.url, altText: fallbackImg.altText }]
                        }
                     />
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
         <Footer />
      </ProductProvider>
   );
}

async function RelatedProducts({ id }: { id: string }) {
   const relatedProducts = await getProductRecommendations(id);

   if (!relatedProducts.length) return null;

   return (
      <div className="p-8 py-8">
         <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
         <ul className="flex w-full gap-4 overflow-x-auto pt-1">
            {relatedProducts.map((product) => (
               <li
                  key={product.handle}
                  className="aspect-[2/3] w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
               >
                  <Link
                     className="relative h-full w-full"
                     href={`/product/${product.handle}`}
                     prefetch={true}
                  >
                     <GridTileImage
                        alt={product.title}
                        label={{
                           title: product.title,
                           amount: product.priceRange.maxVariantPrice.amount,
                           currencyCode: product.priceRange.maxVariantPrice.currencyCode
                        }}
                        // Use the product's featured image if available, else the fallback image.
                        src={product.featuredImage?.url || fallbackImg.url}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                     />
                  </Link>
               </li>
            ))}
         </ul>
      </div>
   );
}
