'use client';

import type { Product } from 'lib/shopify/types';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
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

   const getInitialState = (): ProductState => {
      const params: ProductState = {};
      for (const [key, value] of searchParams.entries()) {
         params[key] = key === 'color' ? value.toLowerCase() : value;
      }
      return params;
   };

   const [state, setState] = useState<ProductState>(getInitialState());

   const updateOption = (name: string, value: string): ProductState => {
      const newState: ProductState = { ...state, [name]: value };
      setState(newState);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productState', JSON.stringify(newState));
      }
      return newState;
   };

   const updateImage = (index: string): ProductState => {
      const newState: ProductState = { ...state, image: index };
      setState(newState);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productState', JSON.stringify(newState));
      }
      return newState;
   };

   const updateProductState = (updates: Partial<ProductState>): ProductState => {
      const newState: ProductState = { ...state, ...updates };
      setState(newState);
      if (typeof window !== 'undefined') {
         localStorage.setItem('productState', JSON.stringify(newState));
      }
      return newState;
   };

   const [activeProduct, setActiveProduct] = useState<Product>(initialProduct);

   const updateActiveProduct = (product: Product) => {
      setActiveProduct((prev) => (prev.id === product.id ? prev : product));
   };

   const { selectedProduct } = useProductGroups();
   useEffect(() => {
      if (selectedProduct && selectedProduct.id !== activeProduct.id) {
         updateActiveProduct(selectedProduct);
      }
   }, [selectedProduct, activeProduct]);

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
   const pathname = usePathname();
   return (state: ProductState) => {
      const newParams = new URLSearchParams(window.location.search);
      Object.entries(state).forEach(([key, value]) => {
         if (value !== undefined) {
            newParams.set(key, value);
         }
      });
      const newUrl = createUrl(pathname, newParams);
      router.push(newUrl, { scroll: false });
   };
}

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
   const paramsString = params.toString();
   const queryString = paramsString.length ? `?${paramsString}` : '';
   return `${pathname}${queryString}`;
};

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
