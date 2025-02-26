// components/product/product-description.tsx
'use client';

import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { useState } from 'react';
import JudgeMePreviewBadge from '../../components/judgeme/JudgeMeProductReview';
import { ProductSpec } from './ProductSpec';
import { VariantSelector } from './variant-selector';

export function ProductDescription({ product }: { product: Product }) {
   const productSpec = product.options.filter((option) => option.name === 'Spec');
   const filteredTitle = product.title
      ? product.title.replace(new RegExp(`\\b${product.options[1]?.values[0]}\\b`, 'i'), '').trim()
      : product.title;

   // Extract the numeric portion from the Shopify product id.
   const numericExternalId = parseInt(product.id.split('/').pop() || '', 10);
   // Default judgeMeId if not provided.
   const judgeMeId = (product as any).judgeMeId ?? -1;

   // State for the description dropdown (open by default)
   const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

   return (
      <>
         <div className="mx-auto flex flex-col justify-start border-b pb-6 dark:border-neutral-700 2xl:mx-auto">
            <div className="mx-8 mt-4 text-start text-sm text-black dark:text-white">
               <div className="flex flex-col items-start justify-start">
                  <h1 className="mb-4 flex justify-start text-start font-sans text-xl 2xl:text-3xl">
                     {filteredTitle}
                  </h1>
                  <JudgeMePreviewBadge
                     externalId={numericExternalId}
                     id={judgeMeId}
                     handle={product.handle}
                  />
                  <div className="mr-auto w-auto pb-3 text-start text-lg text-black">
                     <Price
                        amount={product.priceRange.maxVariantPrice.amount}
                        currencyCode={product.priceRange.maxVariantPrice.currencyCode}
                     />
                  </div>
               </div>
               <VariantSelector
                  options={product.options}
                  variants={product.variants}
                  product={product}
               />
               <AddToCart product={product} />

               {/* Description Dropdown */}
               {product.descriptionHtml && (
                  <div className="my-6 mb-4 border-b pb-2">
                     <button
                        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                        className="flex w-full items-center justify-between text-left text-lg font-normal text-black transition-opacity duration-200 hover:opacity-80 dark:text-white"
                     >
                        <span>Description</span>
                        {isDescriptionOpen ? (
                           // Minus icon when open
                           <svg className="h-6 w-6" viewBox="0 0 24 24">
                              <line
                                 x1="5"
                                 y1="12"
                                 x2="19"
                                 y2="12"
                                 stroke="currentColor"
                                 strokeWidth="1"
                                 strokeLinecap="round"
                              />
                           </svg>
                        ) : (
                           // Plus icon when closed
                           <svg className="h-6 w-6" viewBox="0 0 24 24">
                              <line
                                 x1="12"
                                 y1="5"
                                 x2="12"
                                 y2="19"
                                 stroke="currentColor"
                                 strokeWidth="1"
                                 strokeLinecap="round"
                              />
                              <line
                                 x1="5"
                                 y1="12"
                                 x2="19"
                                 y2="12"
                                 stroke="currentColor"
                                 strokeWidth="1"
                                 strokeLinecap="round"
                              />
                           </svg>
                        )}
                     </button>
                     {isDescriptionOpen && (
                        <div className="mt-4">
                           <Prose
                              className="text-justify text-sm leading-tight dark:text-white/[60%]"
                              html={product.descriptionHtml}
                           />
                        </div>
                     )}
                  </div>
               )}

               {/* Display the product spec */}
               <ProductSpec product={product} />
            </div>
         </div>
      </>
   );
}
