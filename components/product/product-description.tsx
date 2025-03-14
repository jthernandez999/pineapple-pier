'use client';

import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import { useProduct } from 'components/product/product-context';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { useState } from 'react';
import { ProductSpec } from './ProductSpec';
import StretchabilitySection from './StretchabilitySection';
import { VariantSelector } from './variant-selector';

interface ProductDescriptionProps {
   product: Product;
   groupColorMetaobjectIds?: string[];
}

export function ProductDescription({ product, groupColorMetaobjectIds }: ProductDescriptionProps) {
   const { activeProduct } = useProduct();
   const currentProduct = activeProduct || product;
   // console.log('Product metafields::::::::', product.metafield);

   // Remove the color word from the title for display if possible.
   const filteredTitle = currentProduct.title
      ? currentProduct.title
           .replace(new RegExp(`\\b${currentProduct.options[1]?.values[0]}\\b`, 'i'), '')
           .trim()
      : currentProduct.title;

   // Determine stretchability tag.
   const stretchTag: string = currentProduct.tags
      ? currentProduct.tags.some((tag) => tag.toLowerCase() === 'stretch')
         ? 'Stretch'
         : currentProduct.tags.some((tag) => tag.toLowerCase() === 'rigid')
           ? 'Rigid'
           : 'N/A'
      : 'N/A';

   const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
   // console.log('currentProduct tags', currentProduct.tags);

   return (
      <div className="mx-auto flex flex-col justify-start border-b px-2 pb-6 dark:border-neutral-700 md:px-4 2xl:mx-auto">
         <div className="mx-4 mt-2 text-start text-sm text-black dark:text-white">
            <div className="flex flex-col items-start justify-start">
               <h1 className="mb-0 flex justify-start text-start font-sans text-xl md:mb-4 lg:mb-4 2xl:text-3xl">
                  {filteredTitle}
               </h1>
               <div className="mr-auto w-auto pb-3 text-start text-lg text-black">
                  <Price
                     amount={currentProduct.priceRange.maxVariantPrice.amount}
                     currencyCode={currentProduct.priceRange.maxVariantPrice.currencyCode}
                  />
               </div>
            </div>

            <VariantSelector
               options={currentProduct.options}
               variants={currentProduct.variants}
               product={currentProduct}
               metaobjectIdsArray={groupColorMetaobjectIds}
            />
            <AddToCart product={currentProduct} />

            {currentProduct.descriptionHtml && (
               <div className="my-6 mb-4 border-b pb-2">
                  <button
                     onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                     className="flex w-full items-center justify-between text-left text-lg font-normal text-black transition-opacity duration-200 hover:opacity-80 dark:text-white"
                  >
                     <span>Description</span>
                     {isDescriptionOpen ? (
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                           <line
                              x1="5"
                              y1="12"
                              x2="19"
                              y2="12"
                              stroke="currentColor"
                              strokeWidth=".75"
                              strokeLinecap="round"
                           />
                        </svg>
                     ) : (
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                           <line
                              x1="12"
                              y1="5"
                              x2="12"
                              y2="19"
                              stroke="currentColor"
                              strokeWidth=".75"
                              strokeLinecap="round"
                           />
                           <line
                              x1="5"
                              y1="12"
                              x2="19"
                              y2="12"
                              stroke="currentColor"
                              strokeWidth=".75"
                              strokeLinecap="round"
                           />
                        </svg>
                     )}
                  </button>
                  {isDescriptionOpen && (
                     <div className="mt-4">
                        <Prose
                           className="text-justify text-sm font-light leading-tight dark:text-white/[60%]"
                           html={currentProduct.descriptionHtml}
                        />
                     </div>
                  )}
               </div>
            )}

            <ProductSpec product={currentProduct} />
            <StretchabilitySection stretchTag={stretchTag} />
         </div>
      </div>
   );
}
