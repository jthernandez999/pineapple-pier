'use client';
import { Product } from 'lib/shopify/types';
import React, { createContext, useContext, useMemo, useState } from 'react';

interface ProductGroups {
   [group: string]: Product[];
}

interface ProductGroupsContextType {
   groups: ProductGroups;
   setGroups: (groups: ProductGroups) => void;
}

const ProductGroupsContext = createContext<ProductGroupsContextType | undefined>(undefined);

export const ProductGroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [groups, setGroups] = useState<ProductGroups>({});

   const value = useMemo(() => ({ groups, setGroups }), [groups]);

   return <ProductGroupsContext.Provider value={value}>{children}</ProductGroupsContext.Provider>;
};

export function useProductGroups() {
   const context = useContext(ProductGroupsContext);
   if (!context) {
      throw new Error('useProductGroups must be used within a ProductGroupsProvider');
   }
   return context;
}
