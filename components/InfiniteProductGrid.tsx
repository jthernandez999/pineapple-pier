// components/InfiniteScrollProductGrid.tsx
'use client';

import { Product } from 'lib/shopify/types';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useState } from 'react';
import { getCollectionProductsQuery } from '../lib/shopify/queries/collection';

// Dynamically import your server component with SSR enabled.
const ProductGridItems = dynamic(() => import('../components/layout/product-grid-items'), {
   ssr: true,
   loading: () => <div>Loading products...</div>
});

interface InfiniteScrollProductGridProps {
   initialProducts: Product[];
   initialPageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
   };
   collectionHandle: string;
   sortKey: string;
   reverse: boolean;
}

export default function InfiniteScrollProductGrid({
   initialProducts,
   initialPageInfo,
   collectionHandle,
   sortKey,
   reverse
}: InfiniteScrollProductGridProps) {
   const [products, setProducts] = useState<Product[]>(initialProducts);
   const [cursor, setCursor] = useState<string | undefined>(initialPageInfo.endCursor || undefined);
   const [hasNextPage, setHasNextPage] = useState(initialPageInfo.hasNextPage);
   const [isLoading, setIsLoading] = useState(false);

   const loadMoreProducts = useCallback(async () => {
      if (!hasNextPage || isLoading) return;
      setIsLoading(true);
      console.log('Load More triggered. Current cursor:', cursor);

      const variables: any = {
         handle: collectionHandle,
         sortKey,
         reverse
      };
      if (cursor) {
         variables.cursor = cursor;
      }

      try {
         const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'X-Shopify-Storefront-Access-Token':
                  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
            },
            body: JSON.stringify({ query: getCollectionProductsQuery, variables })
         });
         const json = await res.json();
         console.log('Fetch response:', json);

         if (!json.data || !json.data.collection) {
            console.error('No collection found in response:', json);
            setHasNextPage(false);
            setIsLoading(false);
            return;
         }

         const newEdges = json.data.collection.products.edges;
         if (!newEdges || newEdges.length === 0) {
            console.log('No new products returned.');
            setHasNextPage(false);
         } else {
            const newProducts = newEdges.map((edge: any) => edge.node);
            setProducts((prev) => [...prev, ...newProducts]);
            const pageInfo = json.data.collection.products.pageInfo;
            setCursor(pageInfo.endCursor);
            setHasNextPage(pageInfo.hasNextPage);
            console.log('New pageInfo:', pageInfo);
         }
      } catch (error) {
         console.error('Error loading more products:', error);
      }
      setIsLoading(false);
   }, [collectionHandle, sortKey, reverse, cursor, hasNextPage, isLoading]);

   return (
      <>
         <Suspense fallback={<div>Loading products...</div>}>
            <ProductGridItems products={products} groupHandle={collectionHandle} />
         </Suspense>
         {hasNextPage && (
            <div className="mt-4 text-center">
               <button
                  onClick={loadMoreProducts}
                  className="mx-auto rounded border px-4 py-2"
                  disabled={isLoading}
               >
                  {isLoading ? 'Loading...' : 'Load More Products'}
               </button>
            </div>
         )}
      </>
   );
}
