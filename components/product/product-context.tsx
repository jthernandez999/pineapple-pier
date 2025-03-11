'use client';
import type { Product } from 'lib/shopify/types';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useMemo, useState } from 'react';

export type ProductState = {
   [key: string]: string | undefined;
} & { image?: string };

interface ProductContextType {
   state: ProductState;
   updateOption: (name: string, value: string) => void;
   updateImage: (index: string) => void;
   updateProductState: (updates: Partial<ProductState>) => void;
   activeProduct: Product;
   updateActiveProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
   children: React.ReactNode;
   initialProduct: Product;
}

export function ProductProvider({ children, initialProduct }: ProductProviderProps) {
   // Read initial state from the URL search parameters
   const searchParams = useSearchParams();
   const initialState: ProductState = {};
   for (const [key, value] of searchParams.entries()) {
      initialState[key] = value;
   }

   const [state, setState] = useState<ProductState>(initialState);

   const updateOption = (name: string, value: string) => {
      setState((prev) => {
         const newState = { ...prev, [name]: value };
         if (typeof window !== 'undefined') {
            localStorage.setItem('productState', JSON.stringify(newState));
         }
         return newState;
      });
   };

   const updateImage = (index: string) => {
      setState((prev) => {
         const newState = { ...prev, image: index };
         if (typeof window !== 'undefined') {
            localStorage.setItem('productState', JSON.stringify(newState));
         }
         return newState;
      });
   };

   const updateProductState = (updates: Partial<ProductState>) => {
      setState((prev) => {
         const newState = { ...prev, ...updates };
         if (typeof window !== 'undefined') {
            localStorage.setItem('productState', JSON.stringify(newState));
         }
         return newState;
      });
   };

   const [activeProduct, setActiveProduct] = useState<Product>(initialProduct);
   const updateActiveProduct = (product: Product) => {
      setActiveProduct((prev) => (prev.id === product.id ? prev : product));
   };

   const value = useMemo(
      () => ({
         state,
         updateOption,
         updateImage,
         updateProductState,
         activeProduct,
         updateActiveProduct
      }),
      [state, activeProduct]
   );

   return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
   const context = useContext(ProductContext);
   if (!context) {
      throw new Error('useProduct must be used within a ProductProvider');
   }
   return context;
}

export function useUpdateURL() {
   const router = useRouter();
   return (state: ProductState) => {
      const newParams = new URLSearchParams(window.location.search);
      Object.entries(state).forEach(([key, value]) => {
         if (value !== undefined) {
            newParams.set(key, value);
         }
      });
      const newQuery = newParams.toString();
      // Only push if the query has actually changed.
      if (newQuery !== window.location.search.substring(1)) {
         router.push(`?${newQuery}`, { scroll: false });
      }
   };
}

export function useUpdateSpec() {
   const { state, updateOption } = useProduct();
   return (spec: ProductState) => {
      Object.entries(spec).forEach(([key, value]) => {
         if (value !== undefined) {
            updateOption(key, value);
         }
      });
   };
}
