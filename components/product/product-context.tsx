// components/product/product-context.tsx
'use client';
import type { Product } from 'lib/shopify/types';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useMemo, useOptimistic, useState } from 'react';

export type ProductState = {
   [key: string]: string | undefined;
} & {
   image?: string;
};

interface ProductContextType {
   state: ProductState;
   updateOption: (name: string, value: string) => ProductState;
   updateImage: (index: string) => ProductState;
   updateProductState: (updates: Partial<ProductState>) => ProductState;
   activeProduct: Product;
   updateActiveProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
   children: React.ReactNode;
   initialProduct: Product; // now required
}

export function ProductProvider({ children, initialProduct }: ProductProviderProps) {
   const searchParams = useSearchParams();

   const getInitialState = (): ProductState => {
      const params: ProductState = {};
      for (const [key, value] of searchParams.entries()) {
         params[key] = value;
      }
      return params;
   };

   const [state, setOptimisticState] = useOptimistic(
      getInitialState(),
      (prevState: ProductState, update: ProductState) => ({
         ...prevState,
         ...update
      })
   );

   const updateOption = (name: string, value: string): ProductState => {
      const newState = { [name]: value };
      setOptimisticState(newState);
      return { ...state, ...newState };
   };

   const updateImage = (index: string): ProductState => {
      const newState = { image: index };
      setOptimisticState(newState);
      return { ...state, ...newState };
   };

   const updateProductState = (updates: Partial<ProductState>): ProductState => {
      const newState = { ...state, ...updates };
      setOptimisticState(newState);
      return newState;
   };

   // Active product state and updater:
   const [activeProduct, setActiveProduct] = useState<Product>(initialProduct);
   const updateActiveProduct = (product: Product) => {
      setActiveProduct(product);
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
      router.push(`?${newParams.toString()}`, { scroll: false });
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
