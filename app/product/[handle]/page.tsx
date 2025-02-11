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

export async function generateMetadata(props: {
   params: Promise<{ handle: string }>;
}): Promise<Metadata> {
   const params = await props.params;
   const product = await getProduct(params.handle);
   console.log('PRODUCT_COLLECTIONS:', product?.collections.nodes);
   console.log('PRODUCT:', product);
   if (!product) return notFound();

   const { url, width, height, altText: alt } = product.featuredImage || {};
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
   // console.log('product', product);
   if (!product) return notFound();

   const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: product.featuredImage.url,
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
         <div className="mx-auto flex justify-center">
            <main>
               <div className="mx-auto flex max-w-full">
                  <div className="md:pb-[32px] min-[770px]:max-[1024px]:pb-8 lg:mx-auto lg:w-[80vw] lg:items-center lg:justify-center 2xl:w-[80vw]">
                     {/* <div className="flex min-[770px]:max-[1024px]:flex min-[770px]:max-[1024px]:w-full min-[770px]:max-[1024px]:flex-col lg:flex-row"> */}
                     <div className="flex w-full flex-col lg:flex-row">
                        {/* Left: Product Media */}
                        <div className="px-auto mx-auto mt-0 w-screen basis-full pt-0 min-[770px]:max-[1024px]:basis-full lg:basis-4/6 lg:flex-row lg:pr-[2.2rem]">
                           <Suspense
                              fallback={
                                 <div className="relative h-full max-h-[550px] w-full overflow-hidden" />
                              }
                           >
                              <Gallery
                                 images={product.images.map((image: Image) => ({
                                    src: image.url,
                                    altText: image.altText
                                 }))}
                              />
                           </Suspense>
                        </div>

                        {/* Right: Product Details */}
                        <div className="product_productDetail__hIV0I mx-auto flex basis-full flex-col lg:basis-1/2">
                           <Suspense fallback={null}>
                              <ProductDescription product={product} />
                           </Suspense>
                        </div>
                     </div>
                  </div>
               </div>
               <RelatedProducts id={product.id} />
            </main>
         </div>
         <Footer />
      </ProductProvider>
   );
}

async function RelatedProducts({ id }: { id: string }) {
   const relatedProducts = await getProductRecommendations(id);

   if (!relatedProducts.length) return null;

   return (
      <div className="py-8">
         <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
         <ul className="flex w-full gap-4 overflow-x-auto pt-1">
            {relatedProducts.map((product) => (
               <li
                  key={product.handle}
                  className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
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
                        src={product.featuredImage?.url}
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
