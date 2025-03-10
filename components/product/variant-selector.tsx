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
   const { groups } = useProductGroups();

   if (!product) return null;

   const filteredOptions = useMemo(
      () => options.filter((option) => !['spec', 'material'].includes(option.name.toLowerCase())),
      [options]
   );

   if (!filteredOptions.length) return null;

   // ✅ Check if the product is part of a group
   const activeProductGroup = useMemo(() => {
      return Object.keys(groups || {}).find((groupKey) =>
         groups?.[groupKey]?.some((prod) => prod.id === product.id)
      );
   }, [product, groups]);

   const groupProducts = activeProductGroup ? groups?.[activeProductGroup] || [] : [];

   // ✅ Only get group colors if it's a grouped product
   const groupColorMetaobjectIds: string[] = useMemo(() => {
      if (!activeProductGroup) return []; // Only apply to grouped products
      return Array.from(
         new Set(
            groupProducts
               .map((prod) => getColorPatternMetaobjectId(prod))
               .filter((id): id is string => Boolean(id))
         )
      );
   }, [groupProducts, activeProductGroup]);

   console.log('✅ Available Colors in Group:', groupColorMetaobjectIds);

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

   const handleOptionSelect = (optionName: string, value: string) => {
      startTransition(() => {
         const updates: Partial<ProductState> = { [optionName]: value };

         if (optionName === 'color') {
            updates.image = '0'; // ✅ Reset image on color change
         }

         const mergedState = updateProductState(updates);
         updateURL(mergedState);

         if (optionName === 'color' && activeProductGroup) {
            // ✅ Switch product for grouped products only
            const nextProduct = groupProducts.find(
               (prod) => getColorPatternMetaobjectId(prod) === value
            );

            if (nextProduct) {
               console.log('✅ Switching to Product:', nextProduct.title);
               updateActiveProduct(nextProduct);
               return;
            }
         }

         const newVariant = variantMap.find((variant) =>
            Object.keys(mergedState).every((key) => variant[key] === mergedState[key])
         );

         if (newVariant) {
            updateActiveProduct({ ...product, ...newVariant });
         }
      });
   };

   // ✅ Get color name properly (Grouped and Non-grouped products)
   const currentColorName = useMemo(() => {
      if (!state.color) return '';

      if (activeProductGroup) {
         return (
            groupProducts
               .find((prod) => getColorPatternMetaobjectId(prod) === state.color)
               ?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || ''
         );
      }

      return (
         product?.options
            ?.find((o) => o.name.toLowerCase() === 'color')
            ?.values.find((val) => getColorPatternMetaobjectId(product) === state.color) || ''
      );
   }, [state.color, groupProducts, product, activeProductGroup]);

   // ✅ Ensure only the correct colors are displayed (Grouped vs. Non-Grouped)
   const availableColors = useMemo(() => {
      if (activeProductGroup) {
         return groupColorMetaobjectIds; // Only show colors from the group
      }

      return (
         product?.options
            ?.find((o) => o.name.toLowerCase() === 'color')
            ?.values.map((color) => getColorPatternMetaobjectId(product) || color.toLowerCase()) ||
         []
      );
   }, [activeProductGroup, groupColorMetaobjectIds, product]);

   return (
      <>
         {filteredOptions.map((option) => {
            const isColorOption = option.name.toLowerCase() === 'color';

            return (
               <form key={option.id}>
                  <dl className="mx-auto mb-5">
                     <dt className="mb-2 text-sm uppercase tracking-wide">
                        {isColorOption
                           ? `COLOR - ${currentColorName || 'N/A'}`
                           : option.name.toUpperCase()}
                     </dt>

                     <dd className="flex flex-wrap gap-3">
                        {isColorOption ? (
                           <>
                              {availableColors.map((metaobjectId) => {
                                 const isActive =
                                    metaobjectId === getColorPatternMetaobjectId(product);
                                 return (
                                    <button
                                       key={metaobjectId}
                                       type="button"
                                       onClick={() => handleOptionSelect('color', metaobjectId)}
                                       className={clsx(
                                          'relative flex items-center justify-center rounded border p-2 transition-all',
                                          {
                                             'ring-2 ring-blue-600': isActive,
                                             'ring-1 ring-transparent hover:ring-blue-600':
                                                !isActive
                                          }
                                       )}
                                    >
                                       <ColorSwatch
                                          metaobjectId={metaobjectId}
                                          fallbackColor={'#ccc'}
                                       />
                                    </button>
                                 );
                              })}
                           </>
                        ) : (
                           <>
                              {option.values.map((value: string) => {
                                 const optionNameLowerCase = option.name.toLowerCase();
                                 const isActive = state[optionNameLowerCase] === value;

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
                                       onClick={() =>
                                          handleOptionSelect(optionNameLowerCase, value)
                                       }
                                       className={clsx(
                                          'relative flex items-center justify-center rounded border p-2 transition-all',
                                          {
                                             'ring-2 ring-blue-600': isActive,
                                             'ring-1 ring-transparent hover:ring-blue-600':
                                                !isActive,
                                             'cursor-not-allowed opacity-50': !isAvailableForSale
                                          }
                                       )}
                                    >
                                       <span className="text-sm font-medium">{value}</span>
                                    </button>
                                 );
                              })}
                           </>
                        )}
                     </dd>
                  </dl>
               </form>
            );
         })}
      </>
   );
}
