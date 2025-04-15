'use client';

import type { Product } from 'lib/shopify/types';
import localforage from 'localforage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
   // Initialize with an empty object; we'll load the stored data asynchronously
   const [groups, setGroups] = useState<ProductGroups>({});
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

   // Load productGroups from IndexedDB (via localForage) when the component mounts
   useEffect(() => {
      localforage
         .getItem<ProductGroups>('productGroups')
         .then((storedGroups) => {
            if (storedGroups) {
               setGroups(storedGroups);
            }
         })
         .catch((error) => {
            console.error('Error retrieving productGroups:', error);
         });
   }, []);

   function updateGroups(newGroups: ProductGroups) {
      setGroups(newGroups);
      // Save the newGroups object asynchronously using localForage
      localforage
         .setItem('productGroups', newGroups)
         .catch((error) => console.error('Error saving productGroups:', error));
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
