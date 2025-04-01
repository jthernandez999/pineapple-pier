'use client';

import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { getColorPatternMetaobjectId, normalizeMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { Key, startTransition, useEffect, useMemo, useRef } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';
import { useProductGroups } from './ProductGroupsContext';

interface Combination {
   id: string;
   availableForSale: boolean;
   options: Record<string, string>;
   spec?: string;
   imageUrl?: string;
}

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
   const { state, updateProductState, updateActiveProduct } = useProduct();
   const updateURL = useUpdateURL();

   const { groups, selectedProduct, updateSelectedProduct } = useProductGroups();
   const autoMatchedRef = useRef(false);

   // Track the last product ID we handled so we only do “initialization” once.
   const lastProductIdRef = useRef<string | null>(null);

   // --------------------------------------------------------------------------
   // Memos
   // --------------------------------------------------------------------------
   const filteredOptions = useMemo(
      () => options.filter((opt) => !['material', 'spec'].includes(opt.name.toLowerCase())),
      [options]
   );

   if (!filteredOptions.length) return null;

   const activeProductGroup = useMemo(() => {
      const groupKey = Object.keys(groups ?? {}).find((key) =>
         groups[key]?.some((p: { id: string }) => p.id === product.id)
      );
      return groupKey && groupKey.toLowerCase() !== 'uncategorized' ? groupKey : undefined;
   }, [product, groups]);

   const isGrouped = Boolean(activeProductGroup);
   const groupProducts = isGrouped ? (groups[activeProductGroup!] ?? []) : [];

   const colorOption = product.options?.find((o) => o.name.toLowerCase() === 'color');
   const productDisplayColor = colorOption?.values?.[0] ?? '';

   const initialColor = useMemo(() => {
      if (isGrouped && groupProducts.length > 0) {
         return (
            groupProducts[0]?.options
               ?.find((o: { name: string }) => o.name.toLowerCase() === 'color')
               ?.values?.[0]?.toLowerCase() ?? productDisplayColor.toLowerCase()
         );
      }
      return productDisplayColor.toLowerCase();
   }, [isGrouped, groupProducts, productDisplayColor]);

   const variantMap: Combination[] = useMemo(() => {
      return variants.map((v) => {
         const opts = v.selectedOptions.reduce<Record<string, string>>((acc, o) => {
            acc[o.name.toLowerCase()] = String(o.value).toLowerCase();
            return acc;
         }, {});
         return {
            id: v.id,
            availableForSale: v.availableForSale,
            options: opts,
            spec: v?.metafield?.value ?? ''
            // or however you store “spec”
         };
      });
   }, [variants]);

   const availableColors = useMemo(() => {
      if (isGrouped && groupProducts.length > 0) {
         return Array.from(
            new Set(
               groupProducts
                  .map((prod: any) => normalizeMetaobjectId(getColorPatternMetaobjectId(prod)))
                  .filter((id: any): id is string => !!id)
            )
         );
      }
      return [productDisplayColor.toLowerCase()];
   }, [isGrouped, groupProducts, productDisplayColor]);

   // --------------------------------------------------------------------------
   // Single "Initialization" Effect
   //  - Runs only if the product changed (or first render).
   //  - Sets default color/size in context state, updates URL.
   // --------------------------------------------------------------------------
   useEffect(() => {
      // If product is new (or on mount), do the initialization once.
      if (lastProductIdRef.current !== product.id) {
         lastProductIdRef.current = product.id;
         // We haven't auto-matched a variant for this product yet
         autoMatchedRef.current = false;

         const sizeOpt = filteredOptions.find(
            (o: { name: string }) => o.name.toLowerCase() === 'size'
         );
         let defaultSize = '';
         if (sizeOpt) {
            const foundSize = sizeOpt.values.find((val: string) =>
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
      }
   }, [
      product.id,
      isGrouped,
      initialColor,
      productDisplayColor,
      filteredOptions,
      variantMap,
      updateProductState,
      updateURL
   ]);

   // --------------------------------------------------------------------------
   // Second Effect: Match a variant if color/size are set, but not matched yet
   //   (Use approach #2: only require 'size' if it exists)
   // --------------------------------------------------------------------------
   useEffect(() => {
      // Check if there is a size option at all
      const hasSizeOption = filteredOptions.some(
         (o: { name: string }) => o.name.toLowerCase() === 'size'
      );
      // If there's a size option, we need both color & size. Otherwise, just color.
      const canMatch = hasSizeOption ? state.color && state.size : state.color;

      // Only do the variant matching if canMatch is truthy and we haven't matched yet
      if (canMatch && !autoMatchedRef.current) {
         // Attempt to find the “display color” string we must match in variantMap
         const displayColor =
            isGrouped && groupProducts.length > 0
               ? (groupProducts
                    .find((p: { options: any[] }) => {
                       const c = p.options
                          ?.find((o: { name: string }) => o.name.toLowerCase() === 'color')
                          ?.values?.[0]?.toLowerCase();
                       return c === (state.color ?? '').toLowerCase();
                    })
                    ?.options?.find((o: { name: string }) => o.name.toLowerCase() === 'color')
                    ?.values?.[0] ?? '')
               : productDisplayColor;

         // Only match keys that appear in variantMap options
         const keysToMatch: Array<'color' | 'size'> = [];

         if (filteredOptions.some((o: { name: string }) => o.name.toLowerCase() === 'color')) {
            keysToMatch.push('color');
         }
         if (hasSizeOption) {
            keysToMatch.push('size');
         }

         let matchedVariant = variantMap.find((v) =>
            keysToMatch.every((key) => {
               const variantVal = v.options[key] ?? '';
               const stateVal = (state[key] ?? '').toLowerCase();
               if (key === 'color') {
                  return displayColor.toLowerCase() === variantVal;
               }
               return variantVal === stateVal;
            })
         );

         // Fallback to first variant if none matched
         if (!matchedVariant && variantMap.length) {
            matchedVariant = variantMap[0];
         }

         if (matchedVariant) {
            autoMatchedRef.current = true; // prevent re-running this effect

            startTransition(() => {
               // If grouped, find the matching product for that color
               const groupProduct =
                  isGrouped && groupProducts.length > 0
                     ? groupProducts.find((p: { options: any[] }) => {
                          const c = p.options
                             ?.find((o: { name: string }) => o.name.toLowerCase() === 'color')
                             ?.values?.[0]?.toLowerCase();
                          return c === (state.color ?? '').toLowerCase();
                       })
                     : null;

               const base = selectedProduct || groupProduct || product;

               const updatedProduct: ExtendedProduct = {
                  ...base,
                  selectedVariant: matchedVariant,
                  availableForSale: !!matchedVariant.availableForSale,
                  // If we have a grouped product, use its images/media
                  featuredImage: groupProduct ? groupProduct.featuredImage : product.featuredImage,
                  images: groupProduct ? groupProduct.images : product.images,
                  media: groupProduct ? groupProduct.media : product.media
               };

               // Optionally update spec or image
               updateProductState({ spec: matchedVariant.spec ?? '', image: '0' });
               updateActiveProduct(updatedProduct);

               // If not grouped, we can clear the selectedProduct
               if (!isGrouped && selectedProduct) {
                  updateSelectedProduct(null);
               }
            });
         }
      }
   }, [
      state.color,
      state.size,
      filteredOptions,
      isGrouped,
      groupProducts,
      productDisplayColor,
      product,
      selectedProduct,
      variantMap,
      updateActiveProduct,
      updateProductState,
      updateSelectedProduct
   ]);

   // --------------------------------------------------------------------------
   // handleOptionSelect
   // --------------------------------------------------------------------------
   function handleOptionSelect(optionName: string, value: string) {
      startTransition(() => {
         // If we pick a new color, allow variant re-match
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
   // Display Current Color Name
   // --------------------------------------------------------------------------
   const currentColorName = useMemo(() => {
      if (!state.color) return '';
      if (isGrouped && groupProducts.length > 0) {
         const match = groupProducts.find((p: { options: any[] }) => {
            const c = p.options
               ?.find((opt: { name: string }) => opt.name.toLowerCase() === 'color')
               ?.values?.[0]?.toLowerCase();
            return c === (state.color ?? '').toLowerCase();
         });
         return (
            match?.options?.find((o: { name: string }) => o.name.toLowerCase() === 'color')
               ?.values?.[0] ?? ''
         );
      }
      return productDisplayColor;
   }, [state.color, isGrouped, groupProducts, productDisplayColor]);

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
                           ? // COLOR SWATCHES
                             isGrouped
                              ? // GROUPED color swatches
                                availableColors.map((colorId) => {
                                   const matchedProduct = groupProducts.find(
                                      (p: any) =>
                                         normalizeMetaobjectId(getColorPatternMetaobjectId(p)) ===
                                         colorId
                                   );
                                   const colorName =
                                      matchedProduct?.options
                                         ?.find(
                                            (o: { name: string }) =>
                                               o.name.toLowerCase() === 'color'
                                         )
                                         ?.values?.[0]?.toLowerCase() ?? '';
                                   const isActive = colorName === (state.color ?? '').toLowerCase();

                                   return (
                                      <button
                                         key={colorId as Key}
                                         type="button"
                                         onClick={() => handleOptionSelect('color', colorName)}
                                         className={clsx(
                                            'relative flex items-center justify-center transition-all',
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
                              : // NON-GROUPED color
                                option.values.map((val) => {
                                   const isActive =
                                      (state.color ?? '').toLowerCase() === val.toLowerCase();

                                   // Attempt to parse a metafield
                                   let metaobjectId: string | undefined;
                                   let parsedValue: string | undefined;
                                   if (product?.metafield) {
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
                                            'relative flex items-center justify-center rounded-full border p-0 transition-all',
                                            {
                                               'ring-1 ring-black': isActive,
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
                           : // NON-COLOR (like size)
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
                                         'relative flex h-10 w-10 items-center justify-center border p-[.75rem] transition-all',
                                         {
                                            'ring-1 ring-black': isActive,
                                            'ring-1 ring-transparent hover:bg-black hover:text-white':
                                               !isActive,
                                            'skew-45 cursor-not-allowed opacity-40': !isAvailable
                                         }
                                      )}
                                   >
                                      <span className="relative z-10 text-sm font-medium">
                                         {val}
                                      </span>
                                      {!isAvailable && (
                                         <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="h-[0.5px] w-full -rotate-45 transform bg-current"></div>
                                         </div>
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
