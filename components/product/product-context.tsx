'use client';

import type { Product } from 'lib/shopify/types';
import localforage from 'localforage';
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

   // Derive initial state from URL search parameters.
   // Additionally, if no "color" or "size" is specified, default to the first available value from initialProduct options.
   const getInitialState = (): ProductState => {
      const params: ProductState = {};
      // Populate state from URL query parameters
      for (const [key, value] of searchParams.entries()) {
         params[key] = key === 'color' ? value.toLowerCase() : value;
      }
      // Set a default "color" if not provided and available in initialProduct
      if (!params['color'] && initialProduct.options) {
         const colorOption = initialProduct.options.find(
            (option) => option.name.toLowerCase() === 'color'
         );
         if (colorOption && colorOption.values && colorOption.values.length > 0) {
            params['color'] = colorOption.values[0]?.toLowerCase();
         }
      }
      // Set a default "size" if not provided and available in initialProduct
      if (!params['size'] && initialProduct.options) {
         const sizeOption = initialProduct.options.find(
            (option) => option.name.toLowerCase() === 'size'
         );
         if (sizeOption && sizeOption.values && sizeOption.values.length > 0) {
            params['size'] = sizeOption.values[0]?.toLowerCase();
         }
      }
      return params;
   };

   // Initialize state with URL parameters; then merge any stored state.
   const [state, setState] = useState<ProductState>(getInitialState());

   // On mount, load stored product state from localForage and merge it with the initial state.
   useEffect(() => {
      localforage
         .getItem<ProductState>('productState')
         .then((storedState) => {
            if (storedState) {
               setState((prevState) => ({ ...storedState, ...prevState }));
            }
         })
         .catch((error) => {
            console.error('Error loading product state:', error);
         });
   }, [searchParams]);

   const updateOption = (name: string, value: string): ProductState => {
      const newState: ProductState = { ...state, [name]: value };
      setState(newState);
      localforage
         .setItem('productState', newState)
         .catch((error) => console.error('Error saving product state:', error));
      return newState;
   };

   const updateImage = (index: string): ProductState => {
      const newState: ProductState = { ...state, image: index };
      setState(newState);
      localforage
         .setItem('productState', newState)
         .catch((error) => console.error('Error saving product state:', error));
      return newState;
   };

   const updateProductState = (updates: Partial<ProductState>): ProductState => {
      const newState: ProductState = { ...state, ...updates };
      setState(newState);
      localforage
         .setItem('productState', newState)
         .catch((error) => console.error('Error saving product state:', error));
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
