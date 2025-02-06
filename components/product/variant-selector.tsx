'use client';

import clsx from 'clsx';
import { ProductState, useProduct, useUpdateURL } from 'components/product/product-context';
import { ProductOption, ProductVariant } from 'lib/shopify/types';
import { startTransition, useEffect } from 'react';
const SKU = 'BLACK IRIS-DKN2123BCK-1';

type Combination = {
   id: string;
   availableForSale: boolean;
   [key: string]: string | boolean;
};

export function VariantSelector({
   options,
   variants
}: {
   options: ProductOption[];
   variants: ProductVariant[];
}) {
   const { state, updateOption, updateImage, updateProductState } = useProduct();
   const updateURL = useUpdateURL();

   const filteredOptions = options.filter(
      (option) => !['spec', 'material'].includes(option.name.toLowerCase())
   );

   const hasNoOptionsOrJustOneOption =
      !filteredOptions.length ||
      (filteredOptions.length === 1 && filteredOptions[0]?.values.length === 1);

   if (hasNoOptionsOrJustOneOption) {
      return null;
   }

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

   useEffect(() => {
      const colorOption = filteredOptions.find((option) => option.name.toLowerCase() === 'color');
      if (colorOption && !state['color']) {
         const defaultColor = colorOption.values[0];
         const mergedState = updateProductState({
            color: defaultColor,
            image: '0'
         });
         updateURL(mergedState);
      }
   }, [filteredOptions, state, updateProductState, updateURL]);

   const handleOptionSelect = (optionNameLowerCase: string, value: string) => {
      console.log('Option selected:', optionNameLowerCase, value);
      startTransition(() => {
         let updates: Partial<ProductState> = { [optionNameLowerCase]: value };
         if (optionNameLowerCase === 'color') {
            console.log('Color selected; resetting image to index 0');
            updates.image = '0'; // reset image index
         }
         const mergedState = updateProductState(updates);
         console.log('Merged state after selection:', mergedState);
         updateURL(mergedState);
      });
   };
   return filteredOptions.map((option) => (
      <form key={option.id}>
         <dl className="mx-auto mb-8">
            <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
            <dd className="flex flex-wrap gap-3">
               {option.values.map((value) => {
                  const optionNameLowerCase = option.name.toLowerCase();
                  const optionParams = { ...state, [optionNameLowerCase]: value };

                  const filtered = Object.entries(optionParams).filter(([key, val]) =>
                     filteredOptions.find(
                        (opt) =>
                           opt.name.toLowerCase() === key && opt.values.includes(val as string)
                     )
                  );

                  const isAvailableForSale = combinations.find((combination) =>
                     filtered.every(
                        ([key, val]) => combination[key] === val && combination.availableForSale
                     )
                  );

                  const isActive = state[optionNameLowerCase] === value;

                  return (
                     <button
                        type="button"
                        key={value}
                        disabled={!isAvailableForSale}
                        title={`${option.name} ${value}${
                           !isAvailableForSale ? ' (Out of Stock)' : ''
                        }`}
                        onClick={() => handleOptionSelect(optionNameLowerCase, value)}
                        className={clsx(
                           'flex min-w-[48px] items-center justify-center border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900',
                           {
                              'cursor-default ring-2 ring-blue-600': isActive,
                              'ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600':
                                 !isActive && isAvailableForSale,
                              'relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 ring-1 ring-neutral-300 before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 before:dark:bg-neutral-700':
                                 !isAvailableForSale
                           }
                        )}
                     >
                        {value}
                     </button>
                  );
               })}
            </dd>
         </dl>
      </form>
   ));
}
