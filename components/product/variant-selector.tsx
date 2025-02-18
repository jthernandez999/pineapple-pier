'use client';
import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { Product, ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect } from 'react';
import { ColorSwatch } from '../../components/ColorSwatch';

// Optional type for a combination of selected options (used for availability checking)
type Combination = {
   id: string;
   availableForSale: boolean;
   [key: string]: string | boolean;
};

interface VariantSelectorProps {
   options: ProductOption[];
   variants: ProductVariant[];
   product?: Product; // The full product (including metafields) must be passed in
}

export function VariantSelector({ options, variants, product }: VariantSelectorProps) {
   // Retrieve product context state and URL update function
   const { state, updateProductState } = useProduct();
   const updateURL = useUpdateURL();

   // Filter out options that we don't want (e.g. "spec" or "material")
   const filteredOptions = options.filter(
      (option) => !['spec', 'material'].includes(option.name.toLowerCase())
   );

   // If there are no options or only one option with one value, render nothing.
   const hasNoOptionsOrJustOneOption =
      !filteredOptions.length ||
      (filteredOptions.length === 1 && filteredOptions[0]?.values.length === 1);
   if (hasNoOptionsOrJustOneOption) {
      return null;
   }

   // Build combinations from variants for availability checking.
   const combinations: Combination[] = variants.map((variant) => ({
      id: variant.id,
      availableForSale: variant.availableForSale,
      ...variant.selectedOptions.reduce(
         (acc, option) => ({
            ...acc,
            [option.name.toLowerCase()]: option.value
         }),
         {}
      )
   }));

   // On initial render, if no color or size is selected, choose the default ones.
   useEffect(() => {
      const defaults: Partial<ProductState> = {};
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

   // Function to handle when an option is selected.
   const handleOptionSelect = (optionNameLowerCase: string, value: string) => {
      console.log('Option selected:', optionNameLowerCase, value);
      startTransition(() => {
         let updates: Partial<ProductState> = { [optionNameLowerCase]: value };
         if (optionNameLowerCase === 'color') {
            console.log('Color selected; resetting image to index 0');
            updates.image = '0'; // Reset image index when color changes.
         }
         const mergedState = updateProductState(updates);
         console.log('Merged state after selection:', mergedState);
         updateURL(mergedState);
      });
   };

   // Helper to get the swatch color from the product metafields.
   // In our updated approach, the product metafields is an array.
   // We look for a metafield with key "color-pattern" and parse its JSON value.
   const getSwatchColor = (color: string, product?: Product): string => {
      if (product?.metafields && (product.metafields.length ?? 0) > 0) {
         // Look for the metafield with key "color-pattern"
         const found = product.metafields.find((mf: { key: string }) => mf.key === 'color-pattern');
         if (found && found.value) {
            return found.value; // This may be a color code (if not, see below)
         }
      }
      return color.toLowerCase();
   };

   return (
      <>
         {filteredOptions.map((option) => (
            <form key={option.id}>
               <dl className="mx-auto mb-8">
                  <dt className="mb-4 text-sm uppercase tracking-wide">
                     {option.name.toLowerCase() === 'color'
                        ? `${option.name.toUpperCase()} - ${state.color ? state.color.toUpperCase() : ''}`
                        : option.name.toUpperCase()}
                  </dt>
                  <dd className="flex flex-wrap gap-3">
                     {option.values.map((value: string) => {
                        const optionNameLowerCase = option.name.toLowerCase();
                        const isActive = state[optionNameLowerCase] === value;
                        // Determine availability (using your existing logic)
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
                           let metaobjectId: string | null = null;
                           if (
                              product &&
                              product.metafields &&
                              product.metafields.length &&
                              product.metafields.length > 0
                           ) {
                              try {
                                 const found = product.metafields.find(
                                    (mf: { key: string }) => mf.key === 'color-pattern'
                                 );
                                 if (found && found.value) {
                                    // Parse the JSON string (e.g. '["gid://shopify/Metaobject/78677147737"]')
                                    const metaobjectIds = JSON.parse(found.value);
                                    if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
                                       metaobjectId = metaobjectIds[0]; // Use the first metaobject ID.
                                    }
                                 }
                              } catch (error) {
                                 console.error('Error parsing metafield value:', error);
                              }
                           }
                           return (
                              <button
                                 type="button"
                                 disabled={!isAvailableForSale}
                                 title={`${option.name} ${value}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                                 onClick={() => handleOptionSelect(optionNameLowerCase, value)}
                                 style={{
                                    backgroundColor: 'transparent',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '9999px',
                                    padding: 0
                                 }}
                                 className={clsx(
                                    'relative flex items-center justify-center border dark:border-neutral-800',
                                    {
                                       'cursor-default ring-2 ring-blue-600': isActive,
                                       'ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600':
                                          !isActive && isAvailableForSale,
                                       'cursor-not-allowed overflow-hidden text-neutral-500':
                                          !isAvailableForSale
                                    },
                                    !isAvailableForSale &&
                                       'before:absolute before:inset-x-0 before:top-1/2 before:-z-10 before:h-[2px] before:-translate-y-1/2 before:-rotate-45 before:bg-neutral-300 before:transition-transform before:content-[""] dark:before:bg-neutral-700'
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
                        } else {
                           // Render non-color options as normal buttons.
                           return (
                              <button
                                 type="button"
                                 key={value}
                                 disabled={!isAvailableForSale}
                                 title={`${option.name} ${value}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                                 onClick={() => handleOptionSelect(optionNameLowerCase, value)}
                                 className={clsx(
                                    'flex min-w-[18px] items-center justify-center border px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900',
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
