'use client';
import type { Product } from 'lib/shopify/types';
import React, { createContext, useContext, useState } from 'react';

interface ProductGroups {
   [group: string]: Product[];
}

interface ProductGroupsContextType {
   groups: ProductGroups;
   setGroups: (groups: ProductGroups) => void;
   // New: selectedProduct holds the full product details from an interactive group
   selectedProduct: Product | null;
   updateSelectedProduct: (product: Product) => void;
}

const ProductGroupsContext = createContext<ProductGroupsContextType>({
   groups: {},
   setGroups: () => {},
   selectedProduct: null,
   updateSelectedProduct: () => {}
});

export function ProductGroupsProvider({ children }: { children: React.ReactNode }) {
   const [groups, setGroups] = useState<ProductGroups>(() => {
      if (typeof window !== 'undefined') {
         const storedGroups = localStorage.getItem('productGroups');
         return storedGroups ? JSON.parse(storedGroups) : {};
      }
      return {};
   });

   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

   const updateGroups = (newGroups: ProductGroups) => {
      setGroups(newGroups);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productGroups', JSON.stringify(newGroups));
      }
   };

   const updateSelectedProduct = (product: Product) => {
      setSelectedProduct(product);
   };

   return (
      <ProductGroupsContext.Provider
         value={{
            groups,
            setGroups: updateGroups,
            selectedProduct,
            updateSelectedProduct
         }}
      >
         {children}
      </ProductGroupsContext.Provider>
   );
}

export function useProductGroups() {
   return useContext(ProductGroupsContext);
}
