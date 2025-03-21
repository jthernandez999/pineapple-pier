// hooks/useAvailableSizesFromContext.ts
'use client';

import { useProductGroups } from 'components/product/ProductGroupsContext';
import { getAvailableSizes } from 'lib/helpers/getAvailableSizes';
import type { Product } from 'lib/shopify/types';
import { useMemo } from 'react';

export function useAvailableSizesFromContext() {
   const { groups } = useProductGroups();

   // Flatten all product arrays from the groups into one array.
   const products = useMemo(() => {
      const all: Product[] = [];
      Object.values(groups).forEach((groupProducts) => {
         all.push(...groupProducts);
      });
      return all;
   }, [groups]);

   // Use your existing helper to get sizes.
   return getAvailableSizes(products);
}
