'use client';

import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { getColorPatternMetaobjectId, normalizeMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useMemo, useRef } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';
import { useProductGroups } from './ProductGroupsContext';

// Extend Product type temporarily so we can use a "selectedVariant" property.
type ExtendedProduct = Product & { selectedVariant?: Combination };

interface Combination {
   id: string;
   availableForSale: boolean;
   options: Record<string, string>;
   spec?: string;
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
   const autoMatchedRef = useRef(false);

   // Filter out unwanted options.
   const filteredOptions = useMemo(
      () => options.filter((opt) => !['material'].includes(opt.name.toLowerCase())),
      [options]
   );
   if (!filteredOptions.length) return null;

   // Determine if the product belongs to a group.
   // cSpell:disable-next-line
   const activeProductGroup = useMemo(() => {
      const groupKey = Object.keys(groups || {}).find((key) =>
         groups?.[key]?.some((prod) => prod.id === product.id)
      );
      // Treat "uncategorized" (case-insensitive) as not grouped.
      return groupKey && groupKey.toLowerCase() !== 'uncategorized' ? groupKey : undefined;
   }, [product, groups]);
   const isGrouped = Boolean(activeProductGroup);
   const groupProducts = isGrouped ? groups[activeProductGroup!] || [] : [];

   // Get product display color.
   const colorOption = product.options?.find((o) => o.name.toLowerCase() === 'color');
   const productDisplayColor: string =
      colorOption && colorOption.values[0] ? colorOption.values[0] : '';
   // Get and normalize the metaobject ID from the product.
   const rawMetaColor = getColorPatternMetaobjectId(product);
   const normalizedProductMetaColor = normalizeMetaobjectId(rawMetaColor) ?? '';

   console.log(
      '[VariantSelector] productDisplayColor:',
      productDisplayColor,
      'normalizedProductMetaColor:',
      normalizedProductMetaColor
   );

   // Compute available colors.
   const availableColors = useMemo(() => {
      if (isGrouped && groupProducts.length > 0) {
         const groupColors = Array.from(
            new Set(
               groupProducts
                  .map((prod) => normalizeMetaobjectId(getColorPatternMetaobjectId(prod)))
                  .filter((id): id is string => Boolean(id))
            )
         );
         console.log('[VariantSelector] availableColors (grouped):', groupColors);
         return groupColors;
      } else {
         const val = productDisplayColor ? productDisplayColor.toLowerCase() : '';
         console.log('[VariantSelector] availableColors (non-grouped):', [val]);
         return [val];
      }
   }, [isGrouped, groupProducts, productDisplayColor]);

   // Build a variant lookup map.
   const variantMap: Combination[] = useMemo(() => {
      return variants.map((variant) => {
         console.log('[VariantSelector] variantMap:', variant);
         const opts = variant.selectedOptions.reduce<Record<string, string>>((acc, option) => {
            acc[option.name.toLowerCase()] = String(option.value).toLowerCase();
            return acc;
         }, {});
         return {
            id: variant.id,
            availableForSale: variant.availableForSale,
            options: opts
            // may be undefined if not provided
         };
      });
   }, [variants]);

   // --- Reset state when product changes ---
   useEffect(() => {
      autoMatchedRef.current = false;
      const sizeOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'size');
      let defaultSize = '';
      if (sizeOpt) {
         const availableSize = sizeOpt.values.find((val) =>
            variantMap.some(
               (variant) =>
                  variant.options.size &&
                  variant.options.size.toLowerCase() === val.toLowerCase() &&
                  variant.availableForSale === true
            )
         );
         defaultSize = availableSize || sizeOpt.values[0] || '';
      }
      const defaults: Partial<ProductState> = {
         color: isGrouped
            ? normalizedProductMetaColor || (availableColors[0] ?? '')
            : productDisplayColor.toLowerCase(),
         size: defaultSize,
         image: '0',
         spec: ''
      };

      console.log('[VariantSelector] Resetting state on product change:', defaults);
      startTransition(() => {
         const newState = updateProductState(defaults);
         updateURL(newState);
         console.log('[VariantSelector] NEW MERGED STATE AFTER RESET:', newState);
      });
   }, [product.id]);

   // --- Set default selections on mount if missing ---
   useEffect(() => {
      if (state.color && state.size) return;
      const defaults: Partial<ProductState> = {};
      const colOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'color');
      const sizeOpt = filteredOptions.find((opt) => opt.name.toLowerCase() === 'size');
      if (colOpt && !state.color && availableColors.length > 0) {
         defaults.color = isGrouped
            ? normalizedProductMetaColor || (availableColors[0] ?? '')
            : productDisplayColor.toLowerCase();
         defaults.image = '0';
      }
      if (sizeOpt && !state.size) {
         const availableSize = sizeOpt.values.find((val) =>
            variantMap.some(
               (variant) =>
                  variant.options.size &&
                  variant.options.size.toLowerCase() === val.toLowerCase() &&
                  variant.availableForSale === true
            )
         );
         defaults.size = availableSize || sizeOpt.values[0] || '';
      }
      if (!state.spec) {
         defaults.spec = '';
      }
      if (Object.keys(defaults).length) {
         startTransition(() => {
            const newState = updateProductState(defaults);
            console.log('[VariantSelector] Default merged state:', newState);
            updateURL(newState);
         });
      }
   }, [
      filteredOptions,
      availableColors,
      state.color,
      state.size,
      state.spec,
      updateProductState,
      updateURL,
      isGrouped,
      normalizedProductMetaColor,
      productDisplayColor,
      variantMap
   ]);

   // --- Auto Variant Matching ---
   useEffect(() => {
      if (state.color && state.size && !autoMatchedRef.current) {
         console.log('[VariantSelector] Auto variant matching with state:', state);
         const keysToMatch = Object.keys(state).filter(
            (key) => key !== 'image' && key !== 'spec' && key in (variantMap[0]?.options || {})
         );
         console.log('[VariantSelector] Keys to match:', keysToMatch);
         const displayColor =
            isGrouped && groupProducts.length > 0
               ? groupProducts
                    .find(
                       (prod) =>
                          normalizeMetaobjectId(getColorPatternMetaobjectId(prod)) ===
                          (state.color ?? '').toLowerCase()
                    )
                    ?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || ''
               : productDisplayColor;
         console.log('[VariantSelector] displayColor for matching:', displayColor);

         let newVariant = variantMap.find((variant) =>
            keysToMatch.every((key) => {
               const variantVal = variant.options[key] ? variant.options[key].toLowerCase() : '';
               const stateVal = (state[key] ?? '').toLowerCase();
               return key === 'color'
                  ? displayColor.toLowerCase() === variantVal
                  : variantVal === stateVal;
            })
         );

         if (!newVariant && variantMap.length > 0) {
            console.warn('[VariantSelector] No matching variant found. Falling back.');
            newVariant = { ...variantMap[0]!, spec: variantMap[0]!.spec ?? '' };
         }

         console.log('[VariantSelector] newVariant:', newVariant);
         if (newVariant) {
            autoMatchedRef.current = true;
            startTransition(() => {
               // For grouped products, try to pick a matching product.
               const groupProduct =
                  isGrouped && groupProducts.length > 0
                     ? groupProducts.find(
                          (prod) =>
                             normalizeMetaobjectId(getColorPatternMetaobjectId(prod)) ===
                             (state.color ?? '').toLowerCase()
                       )
                     : null;
               const baseProduct = groupProduct ? groupProduct : product;
               const updatedProduct: ExtendedProduct = {
                  ...baseProduct,
                  availableForSale: !!newVariant.availableForSale,
                  selectedVariant: newVariant
               };
               // Update the state with the variant’s spec (or empty string if missing)
               updateProductState({ spec: newVariant.spec ?? '' });
               updateActiveProduct(updatedProduct);
               console.log('[VariantSelector] Auto updated active product:', updatedProduct);
            });
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
               normalizeMetaobjectId(getColorPatternMetaobjectId(prod)) ===
               (state.color ?? '').toLowerCase()
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
         const newState = updateProductState(updates);
         updateURL(newState);
         console.log(`[VariantSelector] Option selected: ${optionName} = ${value}`);
         console.log('[VariantSelector] Merged state after selection:', newState);
      });
   };

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
                              ? // Render grouped swatches.
                                availableColors.map((colorId) => {
                                   const isActive =
                                      (colorId ?? '').toLowerCase() ===
                                      (state.color ?? '').toLowerCase();
                                   return (
                                      <button
                                         key={colorId}
                                         type="button"
                                         onClick={() => handleOptionSelect('color', colorId)}
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
                              : // Render non‑grouped swatches.
                                option.values.map((value) => {
                                   const optName = option.name.toLowerCase();
                                   const isActive =
                                      (state[optName] ?? '').toLowerCase() === value.toLowerCase();
                                   let metaobjectId: string | undefined;
                                   let metafieldValue: string | undefined;
                                   if (product?.metafield) {
                                      const mf = product.metafield as any;
                                      metafieldValue = Array.isArray(mf) ? mf[0]?.value : mf.value;
                                   }
                                   if (metafieldValue) {
                                      try {
                                         const metaobjectIds = JSON.parse(
                                            metafieldValue
                                         ) as string[];
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
                           : // Render non‑color options (like size) as buttons.
                             option.values.map((value) => {
                                const optName = option.name.toLowerCase();
                                const isActive =
                                   (state[optName] ?? '').toLowerCase() === value.toLowerCase();
                                const isAvailable = variantMap.some(
                                   (variant) =>
                                      (variant.options[optName] ?? '').toLowerCase() ===
                                         value.toLowerCase() && Boolean(variant.availableForSale)
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
