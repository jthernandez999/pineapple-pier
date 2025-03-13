'use client';

import type { Product } from 'lib/shopify/types';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ProductGroups {
   [group: string]: Product[];
}

interface ProductGroupsContextType {
   groups: ProductGroups;
   setGroups: (groups: ProductGroups) => void;
   selectedProduct: Product | null;
   updateSelectedProduct: (product: Product | null) => void;
}

const defaultContext: ProductGroupsContextType = {
   groups: {},
   setGroups: () => {},
   selectedProduct: null,
   updateSelectedProduct: () => {}
};

const ProductGroupsContext = createContext<ProductGroupsContextType>(defaultContext);

interface ProductGroupsProviderProps {
   children: ReactNode;
}

export function ProductGroupsProvider({ children }: ProductGroupsProviderProps) {
   const [groups, setGroups] = useState<ProductGroups>(() => {
      if (typeof window !== 'undefined') {
         const storedGroups = localStorage.getItem('productGroups');
         return storedGroups ? JSON.parse(storedGroups) : {};
      }
      return {};
   });

   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

   function updateGroups(newGroups: ProductGroups) {
      setGroups(newGroups);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productGroups', JSON.stringify(newGroups));
      }
   }

   function updateSelectedProduct(product: Product | null) {
      setSelectedProduct(product);
   }

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
   const context = useContext(ProductGroupsContext);
   if (!context) {
      throw new Error('useProductGroups must be used within a ProductGroupsProvider');
   }
   return context;
}
