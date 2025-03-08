'use client';

import clsx from 'clsx';
import { ColorSwatch } from 'components/ColorSwatch';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import {
   dynamicMetaobjectId,
   flattenMetafields,
   getColorPatternMetaobjectId
} from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { useProductGroups } from './ProductGroupsContext';

// Revised Combination type: each variant’s selected options are stored as strings.
interface Combination {
   id: string;
   availableForSale: boolean;
   [key: string]: string | boolean;
}

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product?: Product;
   metaobjectIdsArray?: string[] | [];
}

export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   const { state, activeProduct, updateProductState, updateActiveProduct } = useProduct();
   const { groups } = useProductGroups();
   const updateURL = useUpdateURL();

   if (!product) return null;

   // Use the active product from context if available; otherwise, use the passed product.
   const baseProduct = useMemo(() => activeProduct || product, [activeProduct, product]);

   const activeProductGroup =
      flattenMetafields(baseProduct)
         .find((mf) => mf.key === 'custom.parent_groups')
         ?.value.trim() || 'Uncategorized';

   // ...
   const groupProducts = groups[activeProductGroup] || [];

   // Fallback: if groupProducts is empty, use the current product only
   const fallbackColorIds = product ? [getColorPatternMetaobjectId(product)].filter(Boolean) : [];

   const groupColorMetaobjectIds = useMemo(
      () =>
         Array.from(
            new Set(
               groupProducts.length > 0
                  ? groupProducts
                       .map((prod) => getColorPatternMetaobjectId(prod))
                       .filter((id): id is string => Boolean(id))
                  : fallbackColorIds
            )
         ),
      [groupProducts, fallbackColorIds]
   );

   console.log('groupColorMetaobjectIds from the variant-selector', groupColorMetaobjectIds);
   const metaobjectIdsArray = groupColorMetaobjectIds.length > 0 ? groupColorMetaobjectIds : [];
   // Memoize filtered and sorted options so they are not recomputed on every render.
   const filteredOptions = useMemo(
      () => options.filter((option) => !['spec', 'material'].includes(option.name.toLowerCase())),
      [options]
   );

   const sortedOptions = useMemo(() => {
      return [...filteredOptions].sort((a, b) => {
         if (a.name.toLowerCase() === 'color') return -1;
         if (b.name.toLowerCase() === 'color') return 1;
         return 0;
      });
   }, [filteredOptions]);

   if (
      !filteredOptions.length ||
      (filteredOptions.length === 1 && filteredOptions[0]?.values.length === 1)
   ) {
      return null;
   }

   // Build combinations from variants.
   const combinations: Combination[] = useMemo(
      () =>
         variants.map((variant) => {
            const opts = variant.selectedOptions.reduce<Record<string, string>>((acc, option) => {
               acc[option.name.toLowerCase()] = option.value;
               return acc;
            }, {});
            return {
               id: variant.id,
               availableForSale: variant.availableForSale,
               ...opts
            };
         }),
      [variants]
   );

   // Set defaults for state if not already set.
   useEffect(() => {
      if (state.color || state.size) return;
      const defaults: Partial<ProductState> = {};
      const colorOption = filteredOptions.find((option) => option.name.toLowerCase() === 'color');
      const sizeOption = filteredOptions.find((option) => option.name.toLowerCase() === 'size');

      // if (colorOption && !baseProduct.options.find((opt) => opt.name.toLowerCase() === 'color')) {
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
   }, [filteredOptions, baseProduct, state.color, state.size, updateProductState, updateURL]);
   // Fetch swatch metaobject ID for the active product.
   const [swatchMetaobjectId, setSwatchMetaobjectId] = useState<string | undefined>(undefined);

   useEffect(() => {
      async function fetchSwatchId() {
         if (product) {
            const id = await dynamicMetaobjectId(product);
            setSwatchMetaobjectId(id);
         }
      }
      fetchSwatchId();
   }, [product]);

   // Handler for when an option is selected.
   const handleOptionSelect = (optionName: string, value: string) => {
      startTransition(() => {
         const updates: Partial<ProductState> = { [optionName]: value };
         if (optionName === 'color') {
            updates.image = '0';
         }
         const mergedState = updateProductState(updates);
         updateURL(mergedState);

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
         {filteredOptions.map((option) => (
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
                           // Use the helper from the collection logic.
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
                                    metaobjectIdsArray={groupColorMetaobjectIds.filter(
                                       (id): id is string => !!id
                                    )}
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
