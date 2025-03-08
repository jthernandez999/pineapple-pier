'use client';

import { ProductGridItems } from 'components/layout/product-grid-items';
import { getCollectionProductsQuery } from 'lib/shopify/queries/collection';
import { Product } from 'lib/shopify/types';
import { Suspense, useCallback, useState } from 'react';

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

      const variables = {
         handle: collectionHandle,
         sortKey,
         reverse,
         cursor: cursor ?? undefined
      };
      console.log('VARIABLES::::::', variables);
      try {
         // Call our API route instead of the Shopify endpoint directly.
         const res = await fetch('/api/collection-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: getCollectionProductsQuery, variables }),
            // This instructs Next.js to cache the response at the edge and revalidate every 60 seconds.
            next: { revalidate: 60 }
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
      <div>
         <Suspense fallback={<div>Loading products...</div>}>
            <ProductGridItems products={products} groupHandle={collectionHandle} />
         </Suspense>
         {hasNextPage && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
               <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                     e.preventDefault();
                     loadMoreProducts();
                  }}
                  onFocus={(e) => e.currentTarget.blur()}
                  disabled={isLoading}
               >
                  {isLoading ? (
                     <p className="bg-white-500 pointer-events-none border-spacing-1 animate-pulse cursor-not-allowed px-4 py-2 text-center text-sm font-bold text-black">
                        Loading...
                     </p>
                  ) : (
                     <p className="bg-white-500 border-spacing-1 cursor-pointer px-4 py-2 text-center text-sm font-bold">
                        Load More Products
                     </p>
                  )}
               </button>
            </div>
         )}
      </div>
   );
}
