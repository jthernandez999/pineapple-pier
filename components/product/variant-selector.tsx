// components/product/variant-selector.tsx
'use client';

import clsx from 'clsx';
import { ColorSwatch } from 'components/ColorSwatch';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { dynamicMetaobjectId, getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useState } from 'react';

// Revised Combination type
interface Combination {
   id: string;
   availableForSale: boolean;
   [key: string]: string | boolean;
}

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product?: Product;
}

export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   // Guard in case product is undefined
   if (!product) return null;

   const [swatchMetaobjectId, setSwatchMetaobjectId] = useState<string | undefined>(undefined);
   const { state, updateProductState, updateActiveProduct } = useProduct();
   const updateURL = useUpdateURL();

   // Filter options (ignoring 'spec' and 'material')
   const filteredOptions = options.filter(
      (option) => !['spec', 'material'].includes(option.name.toLowerCase())
   );

   // Optionally sort so "color" comes first
   const sortedOptions = filteredOptions.sort((a, b) => {
      if (a.name.toLowerCase() === 'color') return -1;
      if (b.name.toLowerCase() === 'color') return 1;
      return 0;
   });

   if (
      !filteredOptions.length ||
      (filteredOptions.length === 1 && filteredOptions[0]?.values.length === 1)
   ) {
      return null;
   }

   // Build combinations from variants
   const combinations: Combination[] = variants.map((variant) => {
      const opts = variant.selectedOptions.reduce<Record<string, string>>((acc, option) => {
         acc[option.name.toLowerCase()] = option.value;
         return acc;
      }, {});
      return {
         id: variant.id,
         availableForSale: variant.availableForSale,
         ...opts
      };
   });

   useEffect(() => {
      const defaults: Partial<ProductState> = {};
      const colorOption = filteredOptions.find((option) => option.name.toLowerCase() === 'color');
      const sizeOption = filteredOptions.find((option) => option.name.toLowerCase() === 'size');

      if (colorOption && !state['color']) {
         defaults.color = colorOption.values[0];
         defaults.image = '0';
      }
      if (sizeOption && !state['size']) {
         defaults.size = sizeOption.values[0];
      }

      if (Object.keys(defaults).length > 0) {
         startTransition(() => {
            const mergedState = updateProductState(defaults);
            updateURL(mergedState);
         });
      }
   }, [filteredOptions, state, updateProductState, updateURL]);

   useEffect(() => {
      async function fetchSwatchId() {
         const id = await dynamicMetaobjectId(product);
         setSwatchMetaobjectId(id);
      }
      fetchSwatchId();
   }, [product]);

   const handleOptionSelect = (optionNameLowerCase: string, value: string) => {
      startTransition(() => {
         const updates: Partial<ProductState> = { [optionNameLowerCase]: value };
         if (optionNameLowerCase === 'color') {
            updates.image = '0';
         }
         const mergedState = updateProductState(updates);
         updateURL(mergedState);

         // Find matching variant based on new state
         const newVariant = combinations.find((combination) =>
            filteredOptions.every(
               (opt) => mergedState[opt.name.toLowerCase()] === combination[opt.name.toLowerCase()]
            )
         );

         if (newVariant) {
            const newActiveProduct = { ...product, ...newVariant };
            updateActiveProduct(newActiveProduct);
         }
      });
   };

   return (
      <>
         {sortedOptions.map((option) => (
            <form key={option.id}>
               <dl className="mx-auto mb-5">
                  <dt className="mb-2 text-sm uppercase tracking-wide">
                     {option.name.toLowerCase() === 'color'
                        ? `${option.name.toUpperCase()} - ${state.color ? state.color.toUpperCase() : ''}`
                        : option.name.toUpperCase()}
                  </dt>
                  <dd className="flex flex-wrap gap-3">
                     {option.values.map((value: string) => {
                        const optionKey = option.name.toLowerCase();
                        const isActive = state[optionKey] === value;
                        const testState = { ...state, [optionKey]: value };
                        const isAvailableForSale = Boolean(
                           combinations.find((combination) =>
                              filteredOptions.every(
                                 (opt) =>
                                    testState[opt.name.toLowerCase()] ===
                                    combination[opt.name.toLowerCase()]
                              )
                           )
                        );

                        if (optionKey === 'color') {
                           const swatchColor =
                              getColorPatternMetaobjectId(product) ?? value.toLowerCase();
                           return (
                              <button
                                 key={value}
                                 type="button"
                                 disabled={!isAvailableForSale}
                                 title={`${option.name} ${value}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                                 onClick={() => handleOptionSelect(optionKey, value)}
                                 style={{
                                    backgroundColor: 'transparent',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%'
                                 }}
                                 className={clsx(
                                    'relative flex items-center justify-center border dark:border-neutral-800',
                                    {
                                       'cursor-default ring-2 ring-blue-600': isActive,
                                       'ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600':
                                          !isActive && isAvailableForSale,
                                       'cursor-not-allowed text-neutral-500': !isAvailableForSale
                                    }
                                 )}
                              >
                                 <ColorSwatch
                                    metaobjectId={swatchMetaobjectId || ''}
                                    fallbackColor={value.toLowerCase()}
                                 />
                              </button>
                           );
                        } else {
                           return (
                              <button
                                 key={value}
                                 type="button"
                                 disabled={!isAvailableForSale}
                                 title={`${option.name} ${value}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                                 onClick={() => handleOptionSelect(optionKey, value)}
                                 className={clsx(
                                    'flex h-10 min-h-[30px] w-10 min-w-[30px] items-center justify-center border px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900',
                                    {
                                       'cursor-default ring-2 ring-blue-600': isActive,
                                       'ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600':
                                          !isActive && isAvailableForSale,
                                       'cursor-not-allowed text-neutral-500': !isAvailableForSale
                                    }
                                 )}
                              >
                                 {value}
                              </button>
                           );
                        }
                     })}
                  </dd>
               </dl>
            </form>
         ))}
      </>
   );
}
