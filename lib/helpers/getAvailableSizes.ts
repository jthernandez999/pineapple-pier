// lib/helpers/getAvailableSizes.ts
import type { Product } from 'lib/shopify/types';

export function getAvailableSizes(products: Product[] = []): {
   letters: string[];
   numerics: number[];
} {
   if (!products || products.length === 0) {
      console.log('No products passed to getAvailableSizes');
      return { letters: [], numerics: [] };
   }

   const letterSet = new Set<string>();
   const numericSet = new Set<number>();

   products.forEach((product) => {
      console.log(`Processing product: ${product.handle}`, product.options);
      if (product.options && Array.isArray(product.options)) {
         // Use a flexible check: trim and lowercase, then check if it includes 'size'
         const sizeOption = product.options.find((option: any) =>
            option.name.trim().toLowerCase().includes('size')
         );
         if (sizeOption && Array.isArray(sizeOption.values)) {
            sizeOption.values.forEach((val: string) => {
               const trimmed = val.trim();
               console.log(`Found size: "${trimmed}" in product: ${product.handle}`);
               const asNumber = Number(trimmed);
               if (!isNaN(asNumber)) {
                  numericSet.add(asNumber);
               } else {
                  letterSet.add(trimmed.toUpperCase());
               }
            });
         } else {
            console.log(`Product ${product.handle} has no size option matching criteria`);
         }
      } else {
         console.log(`Product ${product.handle} has no options array`);
      }
   });

   // Enforce fixed letter order: XS, S, M, L, XL.
   const letterOrder = ['XS', 'S', 'M', 'L', 'XL'];
   const letters = letterOrder.filter((size) => letterSet.has(size));
   const numerics = Array.from(numericSet).sort((a, b) => a - b);
   console.log('Final available sizes:', { letters, numerics });
   return { letters, numerics };
}
