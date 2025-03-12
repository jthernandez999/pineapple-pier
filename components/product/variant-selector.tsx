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
   imageUrl?: string;
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
   // Pull both groups and selectedProduct from the product groups context.
   const { groups, selectedProduct } = useProductGroups();
   const autoMatchedRef = useRef(false);

   // Filter out unwanted options.
   const filteredOptions = useMemo(
      () => options.filter((opt) => !['material'].includes(opt.name.toLowerCase())),
      [options]
   );
   if (!filteredOptions.length) return null;

   // Determine if the product belongs to a group.
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
   // For grouped products, use the first product's color if available.
   const initialColor = isGrouped
      ? groupProducts[0]?.options
           ?.find((o) => o.name.toLowerCase() === 'color')
           ?.values[0]?.toLowerCase() || productDisplayColor.toLowerCase()
      : productDisplayColor.toLowerCase();

   console.log(
      '[VariantSelector] productDisplayColor:',
      productDisplayColor,
      'initialColor:',
      initialColor
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
         color: isGrouped ? initialColor : productDisplayColor.toLowerCase(),
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
      // Only reset if the state doesn't already have a color (from the URL)
      if (state.color) return;

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
         color: isGrouped ? initialColor : productDisplayColor.toLowerCase(),
         size: defaultSize,
         image: '0',
         spec: ''
      };

      console.log('[VariantSelector] Resetting state on product mount:', defaults);
      startTransition(() => {
         const newState = updateProductState(defaults);
         updateURL(newState);
         console.log('[VariantSelector] NEW MERGED STATE AFTER MOUNT:', newState);
      });
   }, [product.id, state.color, filteredOptions, productDisplayColor, initialColor, variantMap]);

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
                    .find((prod) => {
                       const prodColor =
                          prod.options
                             ?.find((o) => o.name.toLowerCase() === 'color')
                             ?.values[0]?.toLowerCase() || '';
                       return prodColor === (state.color ?? '').toLowerCase();
                    })
                    ?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || ''
               : productDisplayColor;
         console.log('[VariantSelector] displayColor for matching:', displayColor);

         let newVariant: Combination | undefined = variantMap.find((variant) =>
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
               // Look up the matching group product based on the selected color.
               const groupProduct =
                  isGrouped && groupProducts.length > 0
                     ? groupProducts.find((prod) => {
                          const prodColor =
                             prod.options
                                ?.find((o) => o.name.toLowerCase() === 'color')
                                ?.values[0]?.toLowerCase() || '';
                          return prodColor === (state.color ?? '').toLowerCase();
                       })
                     : null;
               // If a product was selected via the collection page, use it.
               const baseProduct = selectedProduct
                  ? selectedProduct
                  : groupProduct
                    ? groupProduct
                    : product;

               const updatedProduct: ExtendedProduct = {
                  ...baseProduct,
                  availableForSale: !!newVariant!.availableForSale,
                  selectedVariant: newVariant,
                  // Use the image fields from the matching group product if available.
                  featuredImage: groupProduct ? groupProduct.featuredImage : product.featuredImage,
                  images: groupProduct ? groupProduct.images : product.images,
                  media: groupProduct ? groupProduct.media : product.media
               };

               // Update state: reset the image index and update spec.
               updateProductState({ spec: newVariant!.spec ?? '', image: '0' });
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
      updateActiveProduct,
      selectedProduct
   ]);

   // --- Compute current color name for display ---
   const currentColorName = useMemo(() => {
      if (!state.color) return '';
      if (isGrouped && groupProducts.length > 0) {
         const match = groupProducts.find((prod) => {
            const prodColor =
               prod.options
                  ?.find((o) => o.name.toLowerCase() === 'color')
                  ?.values[0]?.toLowerCase() || '';
            return prodColor === (state.color ?? '').toLowerCase();
         });
         return match?.options?.find((o) => o.name.toLowerCase() === 'color')?.values[0] || '';
      }
      return productDisplayColor;
   }, [state.color, groupProducts, isGrouped, productDisplayColor]);
   const displayColorName = currentColorName || '';
   console.log('[VariantSelector] Current state:', state);

   // --- Handle manual option selection ---
   const handleOptionSelect = (optionName: string, value: string) => {
      startTransition(() => {
         // Reset auto-matching so that the useEffect will re-run for new selections.
         if (optionName === 'color') {
            autoMatchedRef.current = false;
         }
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
                                   // Look for a product in the group with the matching metaobject ID.
                                   const matchedProduct = groupProducts.find(
                                      (prod) =>
                                         normalizeMetaobjectId(
                                            getColorPatternMetaobjectId(prod)
                                         ) === colorId
                                   );
                                   // Retrieve the actual color name.
                                   const colorName =
                                      matchedProduct?.options
                                         ?.find((o) => o.name.toLowerCase() === 'color')
                                         ?.values[0]?.toLowerCase() || '';
                                   const isActive = colorName === (state.color ?? '').toLowerCase();
                                   return (
                                      <button
                                         key={colorId}
                                         type="button"
                                         onClick={() => handleOptionSelect('color', colorName)}
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
