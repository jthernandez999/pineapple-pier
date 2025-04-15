// app/providers.tsx
'use client';

import { CartProvider } from 'components/cart/cart-context';
import { ProductGroupsProvider } from 'components/product/ProductGroupsContext';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient();

interface ProvidersProps {
   children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
   // Always provide a promise to CartProvider. If there's no cart,
   // it resolves to undefined, ensuring a valid type.
   const cartPromise = Promise.resolve(undefined);

   return (
      <QueryClientProvider client={queryClient}>
         <ProductGroupsProvider>
            <CartProvider cartPromise={cartPromise}>{children}</CartProvider>
         </ProductGroupsProvider>
         <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
   );
}
