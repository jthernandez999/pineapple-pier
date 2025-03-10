'use client';
import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useMemo } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';
import { useProductGroups } from './ProductGroupsContext';

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product?: Product;
   metaobjectIdsArray?: string[];
}

export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   const { state, updateProductState, updateActiveProduct } = useProduct();
   const updateURL = useUpdateURL();
   const { groups } = useProductGroups(); // ✅ Get product groups

   if (!product) return null;

   const filteredOptions = useMemo(
      () => options.filter((option) => !['spec', 'material'].includes(option.name.toLowerCase())),
      [options]
   );

   if (!filteredOptions.length) return null;

   // ✅ Group Colors Metaobject IDs: Ensures all grouped colors are available
   const groupColorMetaobjectIds = useMemo(() => {
      const activeProductGroup =
         groups &&
         Object.keys(groups).find((groupKey) =>
            groups[groupKey]?.some((prod) => prod.id === product.id)
         );

      if (!activeProductGroup) return [];

      const groupProducts = groups[activeProductGroup] || [];
      const uniqueColors = Array.from(
         new Set(
            groupProducts
               .map((prod) => getColorPatternMetaobjectId(prod))
               .filter((id): id is string => Boolean(id))
         )
      );

      console.log('✅ Grouped Color Metaobject IDs:', uniqueColors);
      return uniqueColors;
   }, [product, groups]);

   // ✅ Variant Map: Ensure proper index signature for TypeScript
   const variantMap = useMemo(() => {
      return variants.map((variant) => {
         const variantOptions = variant.selectedOptions.reduce<Record<string, string>>(
            (acc, option) => {
               acc[option.name.toLowerCase()] = option.value;
               return acc;
            },
            {}
         );
         return {
            id: variant.id,
            availableForSale: variant.availableForSale,
            ...variantOptions
         } as Record<string, string | boolean>;
      });
   }, [variants]);

   // ✅ Ensure default selection on page load
   useEffect(() => {
      if (state.color && state.size) return;

      const defaultSelection: Partial<ProductState> = {};
      const colorOption = filteredOptions.find((opt) => opt.name.toLowerCase() === 'color');
      const sizeOption = filteredOptions.find((opt) => opt.name.toLowerCase() === 'size');

      if (colorOption && !state.color) {
         defaultSelection.color = colorOption.values[0];
      }
      if (sizeOption && !state.size) {
         defaultSelection.size = sizeOption.values[0];
      }

      if (Object.keys(defaultSelection).length) {
         startTransition(() => {
            const mergedState = updateProductState(defaultSelection);
            updateURL(mergedState);
         });
      }
   }, [filteredOptions, state.color, state.size, updateProductState, updateURL]);

   // ✅ Handle selection of color and size
   const handleOptionSelect = (optionName: string, value: string) => {
      startTransition(() => {
         const updates: Partial<ProductState> = { [optionName]: value };

         if (optionName === 'color') {
            updates.image = '0';
         }

         const mergedState = updateProductState(updates);
         updateURL(mergedState);

         // ✅ Find the correct variant based on selected options
         const newVariant = variantMap.find((variant) =>
            Object.keys(mergedState).every((key) => variant[key] === mergedState[key])
         );

         if (newVariant) {
            updateActiveProduct({ ...product, ...newVariant });
         }
      });
   };

   return (
      <>
         {/* Variant Selection Loop */}
         {filteredOptions.map((option) => {
            const isColorOption = option.name.toLowerCase() === 'color';

            return (
               <form key={option.id}>
                  <dl className="mx-auto mb-5">
                     <dt className="mb-2 text-sm uppercase tracking-wide">
                        {isColorOption
                           ? `${option.name.toUpperCase()} - ${state.color?.toUpperCase() || ''}`
                           : option.name.toUpperCase()}
                     </dt>
                     <dd className="flex flex-wrap gap-3">
                        {option.values.map((value: string) => {
                           const optionNameLowerCase = option.name.toLowerCase();
                           const isActive = state[optionNameLowerCase] === value;

                           // ✅ Ensure variant lookup works correctly
                           const isAvailableForSale = variantMap.some(
                              (variant) =>
                                 (variant[optionNameLowerCase] as string) === value &&
                                 (variant.availableForSale as boolean)
                           );

                           return (
                              <button
                                 key={value}
                                 type="button"
                                 disabled={!isAvailableForSale}
                                 onClick={() => handleOptionSelect(optionNameLowerCase, value)}
                                 className={clsx(
                                    'relative flex items-center justify-center rounded border p-2 transition-all',
                                    {
                                       'ring-2 ring-blue-600': isActive,
                                       'ring-1 ring-transparent hover:ring-blue-600':
                                          !isActive && isAvailableForSale,
                                       'cursor-not-allowed opacity-50': !isAvailableForSale
                                    }
                                 )}
                              >
                                 {/* ✅ Individual color swatches */}
                                 {isColorOption ? (
                                    <ColorSwatch
                                       metaobjectId={getColorPatternMetaobjectId(product) ?? ''}
                                       fallbackColor={value.toLowerCase()}
                                       metaobjectIdsArray={groupColorMetaobjectIds} // ✅ Pass grouped colors
                                    />
                                 ) : (
                                    <span className="text-sm font-medium">{value}</span>
                                 )}
                              </button>
                           );
                        })}
                     </dd>
                  </dl>
               </form>
            );
         })}
      </>
   );
}
