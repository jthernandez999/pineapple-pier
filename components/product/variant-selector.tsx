'use client';

import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { getColorPatternMetaobjectId, normalizeMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect, useMemo, useRef } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';
import { useProductGroups } from './ProductGroupsContext';

// Combination must have all fields, no undefined:
interface Combination {
   id: string;
   availableForSale: boolean;
   options: Record<string, string>;
   spec?: string;
   imageUrl?: string;
}

// Extend Shopify Product
type ExtendedProduct = Product & {
   selectedVariant?: Combination;
};

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product: Product;
   metaobjectIdsArray?: string[];
}

export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   // Pull relevant product context
   const { state, updateProductState, updateActiveProduct } = useProduct();
   const updateURL = useUpdateURL();

   // Pull groups, selectedProduct, updateSelectedProduct
   const { groups, selectedProduct, updateSelectedProduct } = useProductGroups();

   // Flag to avoid repeated auto-match
   const autoMatchedRef = useRef(false);

   // Filter out unwanted options (like 'material')
   const filteredOptions = useMemo(
      () => options.filter((opt) => !['material', 'spec'].includes(opt.name.toLowerCase())),
      [options]
   );
   if (!filteredOptions.length) return null;

   // Possibly undefined group logic
   const activeProductGroup = useMemo(() => {
      // Find which group includes this product
      const groupKey = Object.keys(groups ?? {}).find((key) =>
         groups[key]?.some((p) => p.id === product.id)
      );
      // treat 'uncategorized' (case-insensitive) as not grouped
      return groupKey && groupKey.toLowerCase() !== 'uncategorized' ? groupKey : undefined;
   }, [product, groups]);

   const isGrouped = Boolean(activeProductGroup);
   const groupProducts = isGrouped ? (groups[activeProductGroup!] ?? []) : [];

   // Compute product's color
   const colorOption = product.options?.find((o) => o.name.toLowerCase() === 'color');
   const productDisplayColor = colorOption?.values?.[0] ?? '';

   // For grouped, if there's a first product with color, use that; otherwise fallback
   const initialColor = useMemo(() => {
      if (isGrouped && groupProducts.length > 0) {
         return (
            groupProducts[0]?.options
               ?.find((o) => o.name.toLowerCase() === 'color')
               ?.values?.[0]?.toLowerCase() ?? productDisplayColor.toLowerCase()
         );
      }
      return productDisplayColor.toLowerCase();
   }, [isGrouped, groupProducts, productDisplayColor]);

   // Build variant map
   const variantMap: Combination[] = useMemo(() => {
      return variants.map((v) => {
         const opts = v.selectedOptions.reduce<Record<string, string>>((acc, o) => {
            acc[o.name.toLowerCase()] = String(o.value).toLowerCase();
            return acc;
         }, {});
         return {
            id: v.id,
            availableForSale: v.availableForSale,
            options: opts
         };
      });
   }, [variants]);

   // Compute array of possible colors
   const availableColors = useMemo(() => {
      if (isGrouped && groupProducts.length > 0) {
         return Array.from(
            new Set(
               groupProducts
                  .map((prod) => normalizeMetaobjectId(getColorPatternMetaobjectId(prod)))
                  .filter((id): id is string => !!id)
            )
         );
      }
      // If not grouped, just the product's color
      return [productDisplayColor.toLowerCase()];
   }, [isGrouped, groupProducts, productDisplayColor]);

   // --------------------------------------------------------------------------
   // Reset state on product change
   // --------------------------------------------------------------------------
   useEffect(() => {
      autoMatchedRef.current = false;

      // Determine default size
      const sizeOpt = filteredOptions.find((o) => o.name.toLowerCase() === 'size');
      let defaultSize = '';
      if (sizeOpt) {
         const foundSize = sizeOpt.values.find((val) =>
            variantMap.some((v) => v.options.size === val.toLowerCase() && v.availableForSale)
         );
         defaultSize = foundSize || sizeOpt.values[0] || '';
      }

      const defaults: Partial<ProductState> = {
         color: isGrouped ? initialColor : productDisplayColor.toLowerCase(),
         size: defaultSize,
         image: '0',
         spec: ''
      };

      startTransition(() => {
         const newState = updateProductState(defaults);
         updateURL(newState);
      });
   }, [product.id]);

   // --------------------------------------------------------------------------
   // Set default selections on mount if missing
   // --------------------------------------------------------------------------
   useEffect(() => {
      autoMatchedRef.current = false;

      const sizeOpt = filteredOptions.find((o) => o.name.toLowerCase() === 'size');
      const defaultSize =
         sizeOpt?.values.find((val) =>
            variantMap.some((v) => v.options.size === val.toLowerCase() && v.availableForSale)
         ) ??
         sizeOpt?.values?.[0] ??
         '';

      const defaults: Partial<ProductState> = {
         color: isGrouped ? initialColor : productDisplayColor.toLowerCase(),
         size: defaultSize,
         image: '0',
         spec: ''
      };

      startTransition(() => {
         updateProductState(defaults);
         updateURL(defaults);

         if (isGrouped && groupProducts.length > 0) {
            // Attempt to find a product in the group that matches the default color
            const groupProduct = groupProducts.find((p) => {
               const c = p.options
                  ?.find((opt) => opt.name.toLowerCase() === 'color')
                  ?.values?.[0]?.toLowerCase();
               return c === defaults.color;
            });
            const matchedProduct = groupProduct || product;

            // Attempt to find a matching variant for that color
            const matchedVariant =
               matchedProduct.variants.find((v) =>
                  v.selectedOptions.some(
                     (opt) =>
                        opt.name.toLowerCase() === 'color' &&
                        opt.value?.toLowerCase() === defaults.color
                  )
               ) ?? variants[0];

            updateActiveProduct({
               ...matchedProduct,
               selectedVariant: matchedVariant
            } as ExtendedProduct);
         } else {
            // Not grouped: just set first variant
            updateActiveProduct({
               ...product,
               selectedVariant: variants[0]
            } as ExtendedProduct);
         }

         // If not grouped, but there's a leftover selected product, reset
         if (!isGrouped && selectedProduct) {
            updateSelectedProduct(null);
         }
      });
   }, [
      product.id,
      isGrouped,
      filteredOptions,
      initialColor,
      productDisplayColor,
      variantMap,
      groupProducts,
      selectedProduct,
      variants,
      updateProductState,
      updateURL,
      updateActiveProduct,
      updateSelectedProduct
   ]);

   // --------------------------------------------------------------------------
   // Auto Variant Matching
   // --------------------------------------------------------------------------
   useEffect(() => {
      if (state.color && state.size && !autoMatchedRef.current) {
         const keysToMatch = Object.keys(state).filter(
            (k) => k !== 'image' && k !== 'spec' && k in (variantMap[0]?.options || {})
         );

         // If grouped, see if there's a group product matching 'state.color'
         const displayColor =
            isGrouped && groupProducts.length > 0
               ? (groupProducts
                    .find((p) => {
                       const c = p.options
                          ?.find((o) => o.name.toLowerCase() === 'color')
                          ?.values?.[0]?.toLowerCase();
                       return c === (state.color ?? '').toLowerCase();
                    })
                    ?.options?.find((o) => o.name.toLowerCase() === 'color')?.values?.[0] ?? '')
               : productDisplayColor;

         let newVariant = variantMap.find((v) =>
            keysToMatch.every((key) => {
               const variantVal = v.options[key] ?? '';
               const stateVal = (state[key] ?? '').toLowerCase();
               return key === 'color'
                  ? displayColor.toLowerCase() === variantVal
                  : variantVal === stateVal;
            })
         );

         if (!newVariant && variantMap.length > 0) {
            // Fallback variant
            newVariant = {
               ...variantMap[0],
               id: variantMap[0]?.id || '', // ensure a string
               spec: variantMap[0]?.spec ?? '',
               availableForSale: variantMap[0]?.availableForSale ?? false,
               options: variantMap[0]?.options ?? {} // must not be undefined
            };
         }

         if (newVariant) {
            autoMatchedRef.current = true;
            startTransition(() => {
               const groupProduct =
                  isGrouped && groupProducts.length > 0
                     ? groupProducts.find((p) => {
                          const c = p.options
                             ?.find((o) => o.name.toLowerCase() === 'color')
                             ?.values?.[0]?.toLowerCase();
                          return c === (state.color ?? '').toLowerCase();
                       })
                     : null;

               const base = selectedProduct || groupProduct || product;

               const updatedProduct: ExtendedProduct = {
                  ...base,
                  selectedVariant: newVariant,
                  availableForSale: !!newVariant.availableForSale,
                  featuredImage: groupProduct ? groupProduct.featuredImage : product.featuredImage,
                  images: groupProduct ? groupProduct.images : product.images,
                  media: groupProduct ? groupProduct.media : product.media
               };

               updateProductState({ spec: newVariant.spec ?? '', image: '0' });
               updateActiveProduct(updatedProduct);
            });
         }
      }
   }, [
      state,
      variantMap,
      isGrouped,
      groupProducts,
      productDisplayColor,
      product,
      selectedProduct,
      updateActiveProduct,
      updateProductState
   ]);

   // --------------------------------------------------------------------------
   // currentColorName for display
   // --------------------------------------------------------------------------
   const currentColorName = useMemo(() => {
      if (!state.color) return '';
      if (isGrouped && groupProducts.length > 0) {
         const match = groupProducts.find((p) => {
            const c = p.options
               ?.find((opt) => opt.name.toLowerCase() === 'color')
               ?.values?.[0]?.toLowerCase();
            return c === (state.color ?? '').toLowerCase();
         });
         return match?.options?.find((o) => o.name.toLowerCase() === 'color')?.values?.[0] ?? '';
      }
      return productDisplayColor;
   }, [state.color, isGrouped, groupProducts, productDisplayColor]);

   // --------------------------------------------------------------------------
   // handleOptionSelect
   // --------------------------------------------------------------------------
   function handleOptionSelect(optionName: string, value: string) {
      startTransition(() => {
         if (optionName === 'color') {
            autoMatchedRef.current = false;
         }
         const updates: Partial<ProductState> = { [optionName]: value };
         if (optionName === 'color') {
            updates.image = '0';
         }
         const newState = updateProductState(updates);
         updateURL(newState);
      });
   }

   // --------------------------------------------------------------------------
   // Render
   // --------------------------------------------------------------------------
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
                        {isColorOption
                           ? // color swatches
                             isGrouped
                              ? // grouped color swatches
                                availableColors.map((colorId) => {
                                   const matchedProduct = groupProducts.find(
                                      (p) =>
                                         normalizeMetaobjectId(getColorPatternMetaobjectId(p)) ===
                                         colorId
                                   );
                                   const colorName =
                                      matchedProduct?.options
                                         ?.find((o) => o.name.toLowerCase() === 'color')
                                         ?.values?.[0]?.toLowerCase() ?? '';
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
                              : // Non-grouped color
                                option.values.map((val) => {
                                   const isActive =
                                      (state.color ?? '').toLowerCase() === val.toLowerCase();

                                   // Attempt to parse metafield
                                   let metaobjectId: string | undefined;
                                   let parsedValue: string | undefined;
                                   if (product?.metafield) {
                                      // cSpell: disable-next-line
                                      // 'metafield' should be in cSpell config
                                      const mf = product.metafield as any;
                                      parsedValue = Array.isArray(mf) ? mf[0]?.value : mf.value;
                                   }
                                   if (parsedValue) {
                                      try {
                                         const arr = JSON.parse(parsedValue) as string[];
                                         if (arr.length) {
                                            metaobjectId = arr[0];
                                         }
                                      } catch {
                                         // ignore parse error
                                      }
                                   }

                                   return (
                                      <button
                                         key={val}
                                         type="button"
                                         onClick={() =>
                                            handleOptionSelect('color', val.toLowerCase())
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
                                               fallbackColor={val.toLowerCase()}
                                            />
                                         ) : (
                                            <div
                                               style={{
                                                  backgroundColor: val.toLowerCase(),
                                                  width: '18px',
                                                  height: '18px',
                                                  borderRadius: '9999px'
                                               }}
                                            />
                                         )}
                                      </button>
                                   );
                                })
                           : // Non-color (like size)
                             option.values.map((val) => {
                                const optName = option.name.toLowerCase();
                                const isActive =
                                   (state[optName] ?? '').toLowerCase() === val.toLowerCase();
                                const isAvailable = variantMap.some(
                                   (v) =>
                                      (v.options[optName] ?? '').toLowerCase() ===
                                         val.toLowerCase() && v.availableForSale
                                );

                                return (
                                   <button
                                      key={val}
                                      type="button"
                                      disabled={!isAvailable}
                                      onClick={() => handleOptionSelect(optName, val.toLowerCase())}
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
                                      <span className="text-sm font-medium">{val}</span>
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
