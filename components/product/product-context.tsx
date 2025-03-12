'use client';

import type { Product } from 'lib/shopify/types';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProductGroups } from './ProductGroupsContext';

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
   initialProduct: Product;
}

export function ProductProvider({ children, initialProduct }: ProductProviderProps) {
   const searchParams = useSearchParams();

   // Get initial state from URL search parameters.
   const getInitialState = (): ProductState => {
      const params: ProductState = {};
      for (const [key, value] of searchParams.entries()) {
         // Normalize the "color" key to lower-case.
         params[key] = key === 'color' ? value.toLowerCase() : value;
      }
      return params;
   };

   const [state, setState] = useState<ProductState>(getInitialState());

   function updateOption(name: string, value: string): ProductState {
      const newState: ProductState = { ...state, [name]: value };
      setState(newState);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productState', JSON.stringify(newState));
      }
      return newState;
   }

   function updateImage(index: string): ProductState {
      const newState: ProductState = { ...state, image: index };
      setState(newState);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productState', JSON.stringify(newState));
      }
      return newState;
   }

   function updateProductState(updates: Partial<ProductState>): ProductState {
      const newState: ProductState = { ...state, ...updates };
      setState(newState);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productState', JSON.stringify(newState));
      }
      return newState;
   }

   // Active product state and updater.
   const [activeProduct, setActiveProduct] = useState<Product>(initialProduct);

   const updateActiveProduct = (product: Product) => {
      setActiveProduct((prev) => (prev.id === product.id ? prev : product));
   };

   // NEW: If the ProductGroups context has a selectedProduct, override activeProduct.
   const { selectedProduct } = useProductGroups();
   useEffect(() => {
      if (selectedProduct && selectedProduct.id !== activeProduct.id) {
         updateActiveProduct(selectedProduct);
      }
   }, [selectedProduct, activeProduct, updateActiveProduct]);

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
