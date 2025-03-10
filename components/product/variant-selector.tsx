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

   // Exclude unwanted options (like "spec" and "material")
   const filteredOptions = useMemo(
      () => options.filter((opt) => !['spec', 'material'].includes(opt.name.toLowerCase())),
      [options]
   );
   if (!filteredOptions.length) return null;

   // Determine if the current product is in a group.
   // If the group key is "uncategorized" (case‑insensitive), treat it as non‑grouped.
   const activeProductGroup = useMemo(() => {
      const groupKey = Object.keys(groups || {}).find((key) =>
         groups?.[key]?.some((prod) => prod.id === product.id)
      );
      return groupKey && groupKey.toLowerCase() !== 'uncategorized' ? groupKey : undefined;
   }, [product, groups]);

   // For grouped products, get all products in the group.
   const groupProducts = activeProductGroup ? groups[activeProductGroup] || [] : [];

   // Get the product’s default color from its options.
   const colorOption = product.options?.find((o) => o.name.toLowerCase() === 'color');
   const productDefaultColor = colorOption ? colorOption.values[0]?.toLowerCase() : '';

   // Compute available colors:
   // • If the product is grouped (and not "uncategorized"), use the unique color IDs from the group.
   // • Otherwise, use only the product’s own color (from its metafield if available, otherwise the default).
   const availableColors = useMemo(() => {
      if (activeProductGroup && groupProducts.length > 0) {
         const groupColors = Array.from(
            new Set(
               groupProducts
                  .map((prod) => getColorPatternMetaobjectId(prod))
                  .filter((id): id is string => Boolean(id))
            )
         );
         console.log('DEBUG: Grouped available colors:', groupColors);
         return groupColors;
      } else {
         const productColorId = getColorPatternMetaobjectId(product);
         if (productColorId) {
            console.log('DEBUG: Non-grouped product valid color:', productColorId);
            return [productColorId];
         }
         console.log('DEBUG: Non-grouped product default color:', productDefaultColor);
         return productDefaultColor ? [productDefaultColor] : [];
      }
   }, [activeProductGroup, groupProducts, product, productDefaultColor]);

   // Build a lookup map for variants.
   const variantMap = useMemo(() => {
      return variants.map((variant) => {
         const opts = variant.selectedOptions.reduce<Record<string, string>>((acc, option) => {
            acc[option.name.toLowerCase()] = option.value;
            return acc;
         }, {});
         return {
            id: variant.id,
            availableForSale: variant.availableForSale,
            ...opts
         } as Record<string, string | boolean>;
      });
   }, [variants]);

   // On mount, set default selections if not already set.
   useEffect(() => {
      if (state.color && state.size) return;
      const defaultSelection: Partial<ProductState> = {};
      const colOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'color');
      const sizeOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'size');
      if (colOpt && !state.color && availableColors.length > 0) {
         defaultSelection.color = availableColors[0];
         defaultSelection.image = '0';
      }
      if (sizeOpt && !state.size) {
         defaultSelection.size = sizeOpt.values[0];
      }
      if (Object.keys(defaultSelection).length) {
         startTransition(() => {
            const mergedState = updateProductState(defaultSelection);
            updateURL(mergedState);
         });
      }
   }, [filteredOptions, availableColors, state.color, state.size, updateProductState, updateURL]);

   // Compute the current color name.
   const currentColorName = useMemo(() => {
      if (!state.color) return '';
      if (activeProductGroup && groupProducts.length > 0) {
         const match = groupProducts.find(
            (prod) => getColorPatternMetaobjectId(prod) === state.color
         );
         return match?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || '';
      }
      const productColorId = getColorPatternMetaobjectId(product);
      if (productColorId && productColorId === state.color) {
         return colorOption ? colorOption.values[0] : '';
      }
      return productDefaultColor;
   }, [state.color, groupProducts, product, activeProductGroup, colorOption, productDefaultColor]);

   // Handle option selection.
   const handleOptionSelect = (optionName: string, value: string) => {
      startTransition(() => {
         const updates: Partial<ProductState> = { [optionName]: value };
         if (optionName === 'color') {
            updates.image = '0';
         }
         const mergedState = updateProductState(updates);
         updateURL(mergedState);

         // For grouped products, update active product based on the selected color.
         if (optionName === 'color' && activeProductGroup && groupProducts.length > 0) {
            const nextProduct = groupProducts.find(
               (prod) => getColorPatternMetaobjectId(prod) === value
            );
            console.log('DEBUG: Grouped next product:', nextProduct?.title);
            if (nextProduct) {
               updateActiveProduct(nextProduct);
               return;
            }
         }

         // For non‑grouped products (or if no matching group product is found), update variant.
         const newVariant = variantMap.find((variant) =>
            Object.keys(mergedState).every((key) => variant[key] === mergedState[key])
         );
         if (newVariant) {
            updateActiveProduct({ ...product, ...newVariant });
         }
      });
   };

   console.log('DEBUG: Available Colors in VariantSelector:', availableColors);
   console.log('DEBUG: Current state.color:', state.color);

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
                           availableColors.map((colorId) => {
                              const isActive = colorId === state.color;
                              return (
                                 <button
                                    key={colorId}
                                    type="button"
                                    onClick={() => handleOptionSelect('color', colorId)}
                                    className={clsx(
                                       'relative flex items-center justify-center rounded border p-2 transition-all',
                                       {
                                          'ring-2 ring-blue-600': isActive,
                                          'ring-1 ring-transparent hover:ring-blue-600': !isActive
                                       }
                                    )}
                                 >
                                    <ColorSwatch
                                       metaobjectId={
                                          activeProductGroup
                                             ? colorId
                                             : getColorPatternMetaobjectId(product) || ''
                                       }
                                       fallbackColor={'#ccc'}
                                    />
                                 </button>
                              );
                           })
                        ) : (
                           <>
                              {option.values.map((value: string) => {
                                 const optName = option.name.toLowerCase();
                                 const isActive = state[optName] === value;
                                 const isAvailable = variantMap.some(
                                    (variant) =>
                                       (variant[optName] as string) === value &&
                                       (variant.availableForSale as boolean)
                                 );
                                 return (
                                    <button
                                       key={value}
                                       type="button"
                                       disabled={!isAvailable}
                                       onClick={() => handleOptionSelect(optName, value)}
                                       className={clsx(
                                          'relative flex items-center justify-center rounded border p-2 transition-all',
                                          {
                                             'ring-2 ring-blue-600': isActive,
                                             'ring-1 ring-transparent hover:ring-blue-600':
                                                !isActive,
                                             'cursor-not-allowed opacity-50': !isAvailable
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
