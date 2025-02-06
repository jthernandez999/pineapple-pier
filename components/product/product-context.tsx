'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useMemo, useOptimistic } from 'react';

// Allow keys to be string or undefined.
export type ProductState = {
   [key: string]: string | undefined;
} & {
   image?: string;
};

type ProductContextType = {
   state: ProductState;
   updateOption: (name: string, value: string) => ProductState;
   updateImage: (index: string) => ProductState;
   updateProductState: (updates: Partial<ProductState>) => ProductState;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
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

   const value = useMemo(
      () => ({
         state,
         updateOption,
         updateImage,
         updateProductState
      }),
      [state]
   );

   return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
   const context = useContext(ProductContext);
   if (context === undefined) {
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

// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import React, { createContext, useContext, useMemo, useOptimistic } from 'react';

// type ProductState = {
//    [key: string]: string;
// } & {
//    image?: string;
// };

// type ProductContextType = {
//    state: ProductState;
//    updateOption: (name: string, value: string) => ProductState;
//    updateImage: (index: string) => ProductState;
// };

// const ProductContext = createContext<ProductContextType | undefined>(undefined);

// export function ProductProvider({ children }: { children: React.ReactNode }) {
//    const searchParams = useSearchParams();

//    const getInitialState = () => {
//       const params: ProductState = {};
//       for (const [key, value] of searchParams.entries()) {
//          params[key] = value;
//       }
//       return params;
//    };

//    const [state, setOptimisticState] = useOptimistic(
//       getInitialState(),
//       (prevState: ProductState, update: ProductState) => ({
//          ...prevState,
//          ...update
//       })
//    );

//    const updateOption = (name: string, value: string) => {
//       const newState = { [name]: value };
//       setOptimisticState(newState);
//       return { ...state, ...newState };
//    };

//    const updateImage = (index: string) => {
//       const newState = { image: index };
//       setOptimisticState(newState);
//       return { ...state, ...newState };
//    };

//    const value = useMemo(
//       () => ({
//          state,
//          updateOption,
//          updateImage
//       }),
//       [state]
//    );

//    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
// }

// export function useProduct() {
//    const context = useContext(ProductContext);
//    if (context === undefined) {
//       throw new Error('useProduct must be used within a ProductProvider');
//    }
//    return context;
// }

// export function useUpdateURL() {
//    const router = useRouter();

//    return (state: ProductState) => {
//       const newParams = new URLSearchParams(window.location.search);
//       Object.entries(state).forEach(([key, value]) => {
//          newParams.set(key, value);
//       });
//       router.push(`?${newParams.toString()}`, { scroll: false });
//    };
// }

// export function useUpdateSpec() {
//    const { state, updateOption } = useProduct();

//    return (spec: ProductState) => {
//       Object.entries(spec).forEach(([key, value]) => {
//          updateOption(key, value);
//       });
//    };
// }
