'use client';
import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useMemo } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';
import { useProductGroups } from './ProductGroupsContext';

// A simple parser that converts a spec string into an object.
function parseSpec(specString: string): { [key: string]: string } {
   const result: Record<string, string> = {};
   specString.split(',').forEach((part) => {
      const [key, ...rest] = part.split(':');
      if (key && rest.length) {
         result[key.trim()] = rest.join(':').trim();
      }
   });
   return result;
}

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product: Product;
   metaobjectIdsArray?: string[];
}

export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   const { state, updateProductState, updateActiveProduct } = useProduct();
   const updateURL = useUpdateURL();
   const { groups } = useProductGroups();

   console.log('[VariantSelector] Product:', product);

   // Filter out unwanted options.
   const filteredOptions = useMemo(() => {
      const filtered = options.filter(
         (opt) => !['spec', 'material'].includes(opt.name.toLowerCase())
      );
      console.log('[VariantSelector] filteredOptions:', filtered);
      return filtered;
   }, [options]);
   if (!filteredOptions.length) return null;

   // Determine if the product is grouped.
   const activeProductGroup = useMemo(() => {
      const groupKey = Object.keys(groups || {}).find((key) =>
         groups?.[key]?.some((prod) => prod.id === product.id)
      );
      // "uncategorized" is simply ignored here.
      const activeGroup =
         groupKey && groupKey.toLowerCase() !== 'uncategorized' ? groupKey : undefined;
      console.log('[VariantSelector] activeProductGroup:', activeGroup);
      return activeGroup;
   }, [product, groups]);
   const isGrouped = Boolean(activeProductGroup);
   const groupProducts = isGrouped ? groups[activeProductGroup!] || [] : [];

   // Get product's color option.
   const colorOption = product.options?.find((o) => o.name.toLowerCase() === 'color');
   const productDisplayColor = colorOption ? colorOption.values[0] : '';
   const productMetaColor = getColorPatternMetaobjectId(product);
   console.log(
      '[VariantSelector] productDisplayColor:',
      productDisplayColor,
      'productMetaColor:',
      productMetaColor
   );

   // Compute available colors.
   const availableColors = useMemo(() => {
      if (isGrouped && groupProducts.length > 0) {
         const groupColors = Array.from(
            new Set(
               groupProducts
                  .map((prod) => getColorPatternMetaobjectId(prod))
                  .filter((id): id is string => Boolean(id))
            )
         );
         console.log('[VariantSelector] availableColors (grouped):', groupColors);
         return groupColors;
      } else {
         const val = productDisplayColor?.toLowerCase();
         console.log('[VariantSelector] availableColors (non-grouped):', [val]);
         return [val];
      }
   }, [isGrouped, groupProducts, productDisplayColor]);

   // Build a variant lookup map.
   const variantMap = useMemo(() => {
      const map = variants.map((variant) => {
         const opts = variant.selectedOptions.reduce(
            (acc, option) => {
               acc[option.name.toLowerCase()] = option.value.toLowerCase();
               return acc;
            },
            {} as Record<string, string>
         );
         return {
            id: variant.id,
            availableForSale: variant.availableForSale,
            ...opts,
            spec: variant.spec || '' // always a string
         } as Record<string, string | boolean>;
      });
      console.log('[VariantSelector] variantMap:', map);
      return map;
   }, [variants]);

   // --- Reset state when the product changes ---
   useEffect(() => {
      // Only reset if state is empty (i.e. first render)
      if (Object.keys(state).length === 0) {
         const defaults: Partial<ProductState> = {
            color: isGrouped
               ? productMetaColor || availableColors[0]
               : productDisplayColor?.toLowerCase(),
            size: filteredOptions.find((opt) => opt.name.toLowerCase() === 'size')?.values[0] || '',
            image: '0',
            spec: ''
         };
         console.log('[VariantSelector] Resetting state on product change:', defaults);
         startTransition(() => {
            updateProductState(defaults);
            updateURL(defaults);
         });
      }
   }, [product.id]); // run only when the product changes

   // --- Set default selections on mount if missing ---
   useEffect(() => {
      if (state.color && state.size) return;
      const defaults: Partial<ProductState> = {};
      const colOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'color');
      const sizeOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'size');
      if (colOpt && !state.color && availableColors.length > 0) {
         defaults.color = isGrouped
            ? productMetaColor || availableColors[0]
            : productDisplayColor?.toLowerCase();
         defaults.image = '0';
      }
      if (sizeOpt && !state.size) {
         defaults.size = sizeOpt.values[0];
      }
      if (Object.keys(defaults).length) {
         startTransition(() => {
            const mergedState = { ...state, ...defaults };
            updateProductState(defaults);
            updateURL(mergedState);
            console.log('[VariantSelector] Default merged state:', mergedState);
         });
      }
   }, [
      filteredOptions,
      availableColors,
      state.color,
      state.size,
      updateProductState,
      updateURL,
      isGrouped,
      productMetaColor,
      productDisplayColor
   ]);

   // --- Auto Variant Matching ---
   useEffect(() => {
      if (state.color && state.size) {
         console.log('[VariantSelector] Auto variant matching with state:', state);
         const keysToMatch = Object.keys(state).filter(
            (key) => !['image', 'spec'].includes(key) && variantMap[0] && key in variantMap[0]
         );
         console.log('[VariantSelector] Keys to match:', keysToMatch);
         const displayColor =
            isGrouped && groupProducts.length > 0
               ? groupProducts
                    .find(
                       (prod) =>
                          getColorPatternMetaobjectId(prod)?.toLowerCase() ===
                          state.color?.toLowerCase()
                    )
                    ?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || ''
               : productDisplayColor;
         console.log('[VariantSelector] displayColor for matching:', displayColor);
         const newVariant = variantMap.find((variant) =>
            keysToMatch.every((key) => {
               const variantVal = (variant[key] as string).trim().toLowerCase();
               const stateVal = (state[key] as string).trim().toLowerCase();
               return key === 'color'
                  ? displayColor?.trim().toLowerCase() === variantVal
                  : variantVal === stateVal;
            })
         );
         console.log('[VariantSelector] newVariant:', newVariant);
         if (newVariant) {
            const newSpec = typeof newVariant.spec === 'string' ? newVariant.spec : '';
            if (state.spec !== newSpec) {
               startTransition(() => {
                  const updatedState = { ...state, spec: newSpec };
                  updateProductState(updatedState);
                  const groupProduct =
                     isGrouped && groupProducts.length > 0
                        ? groupProducts.find(
                             (prod) =>
                                getColorPatternMetaobjectId(prod)?.toLowerCase() ===
                                state.color?.toLowerCase()
                          )
                        : null;
                  const baseProduct = groupProduct ? groupProduct : product;
                  const updatedProduct = {
                     ...baseProduct,
                     availableForSale: !!newVariant.availableForSale,
                     spec: parseSpec(newSpec),
                     selectedVariant: newVariant
                  };
                  updateActiveProduct(updatedProduct);
                  console.log('[VariantSelector] Auto updated active product:', updatedProduct);
               });
            }
         } else {
            console.warn(
               '[VariantSelector] Auto variant matching found no variant for state:',
               state
            );
         }
      }
   }, [
      state,
      variantMap,
      isGrouped,
      groupProducts,
      productDisplayColor,
      product,
      updateProductState,
      updateActiveProduct
   ]);

   // --- Compute current color name for display ---
   const currentColorName = useMemo(() => {
      if (!state.color) return '';
      if (isGrouped && groupProducts.length > 0) {
         const match = groupProducts.find(
            (prod) =>
               getColorPatternMetaobjectId(prod)?.toLowerCase() === state.color?.toLowerCase()
         );
         return match?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || '';
      }
      return productDisplayColor;
   }, [state.color, groupProducts, isGrouped, productDisplayColor]);
   const displayColorName = currentColorName || '';
   console.log('[VariantSelector] Current state:', state);

   // --- Handle manual option selection ---
   const handleOptionSelect = (optionName: string, value: string) => {
      startTransition(() => {
         const updates: Partial<ProductState> = { [optionName]: value };
         if (optionName === 'color') {
            updates.image = '0';
         }
         const mergedState = { ...state, ...updates };
         updateProductState(updates);
         updateURL(mergedState);
         console.log(`[VariantSelector] Option selected: ${optionName} = ${value}`);
         console.log('[VariantSelector] Merged state after selection:', mergedState);
      });
   };

   // --- Render options ---
   return (
      <>
         {filteredOptions.map((option) => {
            const isColorOption = option.name.toLowerCase() === 'color';
            return (
               <form key={option.id}>
                  <dl className="mx-auto mb-5">
                     <dt className="mb-2 text-sm uppercase tracking-wide">
                        {isColorOption
                           ? `COLOR - ${displayColorName || 'N/A'}`
                           : option.name.toUpperCase()}
                     </dt>
                     <dd className="flex flex-wrap gap-3">
                        {isColorOption
                           ? isGrouped
                              ? // Grouped: Render swatches from availableColors.
                                availableColors.map((colorId) => {
                                   const isActive =
                                      colorId?.toLowerCase() === state.color?.toLowerCase();
                                   return (
                                      <button
                                         key={colorId}
                                         type="button"
                                         onClick={() =>
                                            handleOptionSelect('color', colorId as string)
                                         }
                                         className={clsx(
                                            'relative flex items-center justify-center rounded border p-2 transition-all',
                                            {
                                               'ring-2 ring-blue-600': isActive,
                                               'ring-1 ring-transparent hover:ring-blue-600':
                                                  !isActive
                                            }
                                         )}
                                      >
                                         <ColorSwatch metaobjectId={colorId} fallbackColor="#ccc" />
                                      </button>
                                   );
                                })
                              : // Non-grouped: Render swatches via product metafield lookup.
                                // Non-grouped: render swatches via metafield lookup.
                                option.values.map((value) => {
                                   const optName = option.name.toLowerCase();
                                   const isActive = state[optName] === value.toLowerCase();
                                   let metaobjectId: string | null = null;
                                   // Updated lookup: check for the singular 'metafield'
                                   if (product?.metafield && product.metafield.value) {
                                      try {
                                         const metaobjectIds = JSON.parse(product.metafield.value);
                                         if (
                                            Array.isArray(metaobjectIds) &&
                                            metaobjectIds.length > 0
                                         ) {
                                            metaobjectId = metaobjectIds[0];
                                         }
                                      } catch (error) {
                                         console.error(
                                            '[VariantSelector] Error parsing metafield value:',
                                            error
                                         );
                                      }
                                   }
                                   // Render the swatch
                                   return (
                                      <button
                                         key={value}
                                         type="button"
                                         onClick={() =>
                                            handleOptionSelect(optName, value.toLowerCase())
                                         }
                                         className={clsx(
                                            'relative flex items-center justify-center rounded border p-2 transition-all',
                                            {
                                               'ring-2 ring-blue-600': isActive,
                                               'ring-1 ring-transparent hover:ring-blue-600':
                                                  !isActive
                                            }
                                         )}
                                      >
                                         {metaobjectId ? (
                                            <ColorSwatch
                                               metaobjectId={metaobjectId}
                                               fallbackColor={value.toLowerCase()}
                                            />
                                         ) : (
                                            <div
                                               style={{
                                                  backgroundColor: value.toLowerCase(),
                                                  width: '18px',
                                                  height: '18px',
                                                  borderRadius: '9999px'
                                               }}
                                            />
                                         )}
                                      </button>
                                   );
                                })
                           : // Render non-color options (e.g. size)
                             option.values.map((value) => {
                                const optName = option.name.toLowerCase();
                                const isActive = state[optName] === value.toLowerCase();
                                const isAvailable = variantMap.some(
                                   (variant) =>
                                      (variant[optName] as string).toLowerCase() ===
                                         value.toLowerCase() &&
                                      (variant.availableForSale as boolean)
                                );
                                return (
                                   <button
                                      key={value}
                                      type="button"
                                      disabled={!isAvailable}
                                      onClick={() =>
                                         handleOptionSelect(optName, value.toLowerCase())
                                      }
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
                     </dd>
                  </dl>
               </form>
            );
         })}
      </>
   );
}
