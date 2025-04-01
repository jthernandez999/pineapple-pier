'use client';

import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import { useProduct } from 'components/product/product-context';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ProductSpec } from './ProductSpec';
import { StretchabilitySection } from './StretchabilitySection';
import { VariantSelector } from './variant-selector';

interface ProductDescriptionProps {
   product: Product;
   groupColorMetaobjectIds?: string[];
}

// Global declaration for Judge.me on window.
declare global {
   interface Window {
      jdgm: {
         init: () => void;
         SHOP_DOMAIN?: string;
         PLATFORM?: string;
         PUBLIC_TOKEN?: string;
      };
   }
}

export function ProductDescription({ product, groupColorMetaobjectIds }: ProductDescriptionProps) {
   const { activeProduct } = useProduct();
   const currentProduct = activeProduct || product;
   const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

   // Compute numeric product id synchronously.
   const numericProductId = useMemo(() => {
      if (currentProduct && currentProduct.id) {
         const parts = currentProduct.id.split('/');
         const idStr = parts[parts.length - 1];
         const idNumber = Number(idStr);
         console.log('Computed numeric product id:', idNumber);
         return !isNaN(idNumber) ? idNumber : null;
      }
      return null;
   }, [currentProduct]);
   console.log('numericProductId:', numericProductId);

   // Use usePathname to detect route changes (client-side navigation).
   const pathname = usePathname();

   // Get the SKU from the first variant and remove everything from the colon (":") onward.
   let baseSku = '';
   if (currentProduct.variants && currentProduct.variants.length > 0) {
      const sku = currentProduct.variants[0]?.sku ?? '';
      const colonIndex = sku.indexOf(':');
      baseSku = colonIndex !== -1 ? sku.substring(0, colonIndex) : sku;
   }

   // Use widgetKey to force re-mounting of the widget container.
   const [widgetKey, setWidgetKey] = useState<string>(`judge-me-${numericProductId}`);
   useEffect(() => {
      if (numericProductId !== null) {
         setWidgetKey(`judge-me-${numericProductId}-${Date.now()}`);
      }
   }, [pathname, numericProductId]);

   // Once widgetKey is updated, call Judge.me's init.
   useEffect(() => {
      if (numericProductId !== null && window.jdgm && typeof window.jdgm.init === 'function') {
         console.log('Reinitializing Judge.me widget after widget remount');
         window.jdgm.init();
      }
   }, [widgetKey, numericProductId]);

   // Remove the color word from the title for display if possible.
   const filteredTitle = currentProduct.title
      ? currentProduct.title
           .replace(new RegExp(`\\b${currentProduct.options[1]?.values[0]}\\b`, 'i'), '')
           .trim()
      : currentProduct.title;

   const normalizedTags = currentProduct.tags
      ? currentProduct.tags.map((tag) => tag.trim().toLowerCase())
      : [];

   // Determine stretchability tag.
   const stretchTag: string = normalizedTags.includes('stretch')
      ? 'Stretch'
      : normalizedTags.includes('rigid')
        ? 'Rigid'
        : 'N/A';

   return (
      <div className="mx-auto flex flex-col justify-start border-b px-2 pb-6 dark:border-neutral-700 md:px-4 2xl:mx-auto">
         <div className="mx-4 mt-2 text-start text-sm text-black dark:text-white">
            <div className="flex flex-col items-start justify-start">
               <h1 className="mb-0 flex justify-start text-start font-sans text-xl md:mb-2 lg:mb-2 2xl:text-3xl">
                  {filteredTitle}
               </h1>
               <p
                  data-sku
                  className="mb-2 text-xs font-light text-black dark:text-white md:text-xs lg:text-xs 2xl:text-sm"
               >
                  {baseSku || 'No SKU available'}
               </p>
               {/* Judge.me Preview Badge */}
               <div>
                  {numericProductId !== null && (
                     <div
                        className="jdgm-widget jdgm-preview-badge"
                        data-id={numericProductId}
                     ></div>
                  )}
               </div>
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
