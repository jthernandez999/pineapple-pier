'use client';

import clsx from 'clsx';
import { useProduct, useUpdateURL } from 'components/product/product-context';
import { dynamicMetaobjectId, getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import type { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';

// We'll assume our Product type only has metafields (an array).
interface ProductWithOptionalMetafield extends Product {
   metafield?: { key: string; value: string };
}

// Define a type for variant combinations.
// This allows additional keys to be string or boolean.
type Combination = {
   id: string;
   availableForSale: boolean;
} & { [key: string]: string | boolean };

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product?: Product;
}

/**
 * This implementation relies on getColorPatternMetaobjectId for fallback swatch color.
 * It updates the product state and URL when an option is selected,
 * and when the color changes it looks up a matching variant.
 */
export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   const [swatchMetaobjectId, setSwatchMetaobjectId] = useState<string | undefined>(undefined);
   const { state, updateProductState, updateActiveProduct, activeProduct } = useProduct();
   const updateURL = useUpdateURL();

   const filteredOptions = options.filter(
      (option) => !['spec', 'material'].includes(option.name.toLowerCase())
   );

   // Ensure the color option is at the top.
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

   // Compute combinations from variants.
   const combinations: Combination[] = useMemo(() => {
      return variants.map((variant) => ({
         id: variant.id,
         availableForSale: variant.availableForSale,
         ...variant.selectedOptions.reduce<Record<string, string>>((acc, option) => {
            acc[option.name.toLowerCase()] = option.value;
            return acc;
         }, {})
      }));
   }, [variants]);

   useEffect(() => {
      const defaults: Partial<typeof state> = {};
      const colorOption = filteredOptions.find((option) => option.name.toLowerCase() === 'color');
      const sizeOption = filteredOptions.find((option) => option.name.toLowerCase() === 'size');

      if (colorOption && !state['color']) {
         defaults.color = colorOption.values[0];
         defaults.image = '0';
      }
      if (sizeOption && !state['size']) {
         defaults.size = sizeOption.values[0];
      }

      if (Object.keys(defaults).length) {
         const mergedState = updateProductState(defaults);
         updateURL(mergedState);
      }
   }, [filteredOptions, state, updateProductState, updateURL]);

   const handleOptionSelect = (optionNameLowerCase: string, value: string) => {
      startTransition(() => {
         const updates: Partial<typeof state> = { [optionNameLowerCase]: value };
         if (optionNameLowerCase === 'color') {
            updates.image = '0'; // Reset image index when color changes.
         }
         const mergedState = updateProductState(updates);
         console.log('Merged state after selection:', mergedState);
         updateURL(mergedState);
      });
   };

   useEffect(() => {
      // Fetch a dynamic metaobject id for swatch fallback.
      async function fetchSwatchId() {
         if (product) {
            const id = await dynamicMetaobjectId(product);
            setSwatchMetaobjectId(id);
         }
      }
      fetchSwatchId();
   }, [product]);

   // When the color option changes, update the active product variant.
   useEffect(() => {
      if (!product || !state.color) return;
      const selectedColor = state.color.toLowerCase().trim();
      // Find the matching variant combination.
      const matchingCombination = combinations.find(
         (comb) =>
            String(comb['color']).toLowerCase().trim() === selectedColor && comb.availableForSale
      );
      if (matchingCombination && product) {
         // For now, we use the base product as a placeholder.
         // Replace this with logic to merge variant details into the product.
         if (product.id !== activeProduct.id) {
            console.log('Updating active product variant to:', matchingCombination.id);
            updateActiveProduct(product);
         }
      }
   }, [state.color, combinations, product, activeProduct, updateActiveProduct]);

   return (
      <>
         {sortedOptions.map((option) => (
            <form key={option.id}>
               <dl className="mx-auto mb-5">
                  <dt className="mb-2 text-sm uppercase tracking-wide">
                     {option.name.toLowerCase() === 'color'
                        ? `${option.name.toUpperCase()} - ${
                             state.color ? state.color.toUpperCase() : ''
                          }`
                        : option.name.toUpperCase()}
                  </dt>
                  <dd className="flex flex-wrap gap-3">
                     {option.values.map((value: string) => {
                        const optionNameLowerCase = option.name.toLowerCase();
                        const isActive = state[optionNameLowerCase] === value;
                        const filtered = Object.entries({
                           ...state,
                           [optionNameLowerCase]: value
                        }).filter(([key, val]) =>
                           filteredOptions.find(
                              (opt) =>
                                 opt.name.toLowerCase() === key &&
                                 opt.values.includes(val as string)
                           )
                        );
                        const isAvailableForSale = Boolean(
                           combinations.find((combination) =>
                              filtered.every(
                                 ([key, val]) =>
                                    combination[key] === val && combination.availableForSale
                              )
                           )
                        );

                        if (optionNameLowerCase === 'color') {
                           const swatchColor =
                              getColorPatternMetaobjectId(product) ?? value.toLowerCase();
                           return (
                              <button
                                 key={value}
                                 type="button"
                                 disabled={!isAvailableForSale}
                                 title={`${option.name} ${value}${
                                    !isAvailableForSale ? ' (Out of Stock)' : ''
                                 }`}
                                 onClick={() => handleOptionSelect(optionNameLowerCase, value)}
                                 style={{
                                    backgroundColor: 'transparent',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    padding: ''
                                 }}
                                 className={clsx(
                                    'relative flex items-center justify-center border dark:border-neutral-800',
                                    {
                                       'cursor-default ring-2 ring-blue-600': isActive,
                                       'ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600':
                                          !isActive && isAvailableForSale,
                                       'cursor-not-allowed overflow-hidden text-neutral-500':
                                          !isAvailableForSale
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
                                 title={`${option.name} ${value}${
                                    !isAvailableForSale ? ' (Out of Stock)' : ''
                                 }`}
                                 onClick={() => handleOptionSelect(optionNameLowerCase, value)}
                                 className={clsx(
                                    'flex h-10 min-h-[30px] w-10 min-w-[30px] items-center justify-center border px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900',
                                    {
                                       'cursor-default ring-2 ring-blue-600': isActive,
                                       'ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600':
                                          !isActive && isAvailableForSale,
                                       'relative z-10 cursor-not-allowed overflow-hidden text-neutral-500 ring-1 ring-neutral-300 before:absolute before:inset-x-0 before:top-1/2 before:-z-10 before:h-[2px] before:-translate-y-1/2 before:-rotate-45 before:bg-neutral-300 before:transition-transform before:content-[""] dark:before:bg-neutral-700':
                                          !isAvailableForSale
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
