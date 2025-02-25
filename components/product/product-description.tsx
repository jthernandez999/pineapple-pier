// ProductDescription.tsx
import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import JudgeMePreviewBadge from '../../components/judgeme/JudgeMeProductReview';
import { ProductSpec } from './ProductSpec';
import { VariantSelector } from './variant-selector';

export function ProductDescription({ product }: { product: Product }) {
   const productSpec = product.options.filter((option) => option.name === 'Spec');
   const filteredTitle = product.title
      ? product.title.replace(new RegExp(`\\b${product.options[1]?.values[0]}\\b`, 'i'), '').trim()
      : product.title;
   // Extract the numeric portion from the product id
   const numericId = parseInt(product.id.split('/').pop() || '', 10);
   return (
      <>
         <div className="mx-auto flex flex-col justify-start border-b pb-6 dark:border-neutral-700 2xl:mx-auto">
            <div className="mx-8 mt-4 text-start text-sm text-black dark:text-white">
               <div className="flex flex-col items-start justify-start">
                  <h1 className="mb-4 flex justify-start text-start font-sans text-xl 2xl:text-3xl">
                     {filteredTitle}
                  </h1>
                  {/* <div className="jdgm-widget jdgm-preview-badge" data-id={product.id}></div> */}
                  <JudgeMePreviewBadge externalId={numericId} />
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

               {product.descriptionHtml
                  ? (console.log('Product Description:', product.descriptionHtml),
                    (
                       <Prose
                          className="my-6 text-justify text-sm leading-tight dark:text-white/[60%]"
                          html={product.descriptionHtml}
                       />
                    ))
                  : null}
               {/* Insert the new spec display component */}
               {/* <p>Spec:{productSpec.map((option) => option.values.map((value) => value)).join(', ')} </p> */}
               <ProductSpec product={product} />
            </div>
         </div>
      </>
   );
}
