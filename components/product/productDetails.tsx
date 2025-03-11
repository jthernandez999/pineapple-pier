// ProductDetails.tsx
import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { VariantSelector } from './variant-selector';

export function ProductDetails({ product }: { product: Product }) {
   const { title, priceRange, descriptionHtml, options, variants, spec } = product;
   const { Material, ...otherSpecs } = spec || {};

   return (
      <div>
         {/* Title & Price */}
         <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
            <h1 className="mb-2 text-5xl font-medium">{title}</h1>
            <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
               <Price
                  amount={priceRange.maxVariantPrice.amount}
                  currencyCode={priceRange.maxVariantPrice.currencyCode}
               />
            </div>
         </div>

         {/* Variant Selector */}
         <VariantSelector
            options={options}
            variants={variants}
            product={product}
            // metaobjectIdsArray={groupColorMetaobjectIds}
         />

         {/* Description */}
         {descriptionHtml && (
            <Prose
               className="mb-6 text-sm leading-tight dark:text-white/[60%]"
               html={descriptionHtml}
            />
         )}

         {/* Additional Spec Data */}
         <div className="mb-6">
            <div>
               <h2 className="text-lg font-semibold">Spec</h2>
               {otherSpecs['Front Rise'] && (
                  <p>
                     <strong>Front Rise:</strong> {otherSpecs['Front Rise']}
                  </p>
               )}
               {otherSpecs['Leg Opening'] && (
                  <p>
                     <strong>Leg Opening:</strong> {otherSpecs['Leg Opening']}
                  </p>
               )}
               {otherSpecs['Inseam'] && (
                  <p>
                     <strong>Inseam:</strong> {otherSpecs['Inseam']}
                  </p>
               )}
            </div>
            {Material && (
               <div className="mt-4">
                  <h2 className="text-lg font-semibold">Material</h2>
                  <p>{Material}</p>
               </div>
            )}
         </div>

         {/* Add to Cart */}
         <AddToCart product={product} />
      </div>
   );
}
