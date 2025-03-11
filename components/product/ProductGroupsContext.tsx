'use client';
import type { Product } from 'lib/shopify/types';
import React, { createContext, useContext, useState } from 'react';

interface ProductGroups {
   [group: string]: Product[];
}

interface ProductGroupsContextType {
   groups: ProductGroups;
   setGroups: (groups: ProductGroups) => void;
}

const ProductGroupsContext = createContext<ProductGroupsContextType>({
   groups: {},
   setGroups: () => {}
});

export function ProductGroupsProvider({ children }: { children: React.ReactNode }) {
   const [groups, setGroups] = useState<{ [groupKey: string]: Product[] }>(() => {
      if (typeof window !== 'undefined') {
         const storedGroups = localStorage.getItem('productGroups');
         return storedGroups ? JSON.parse(storedGroups) : {};
      }
      return {};
   });

   const updateGroups = (newGroups: { [groupKey: string]: Product[] }) => {
      setGroups(newGroups);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productGroups', JSON.stringify(newGroups));
      }
   };

   return (
      <ProductGroupsContext.Provider value={{ groups, setGroups: updateGroups }}>
         {children}
      </ProductGroupsContext.Provider>
   );
}

export function useProductGroups() {
   return useContext(ProductGroupsContext);
}
