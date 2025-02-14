'use client';

import { Product } from 'lib/shopify/types';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
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

   // Use a ref flag to prevent repeated triggers before loading finishes.
   const loadingRef = useRef(false);

   // Sentinel ref for the intersection observer.
   const sentinelRef = useRef<HTMLDivElement>(null);

   const loadMoreProducts = useCallback(async () => {
      if (!hasNextPage || isLoading || loadingRef.current) return;
      loadingRef.current = true;
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
            // Delay resetting loadingRef to ensure the sentinel isn’t immediately triggering again
            setTimeout(() => {
               loadingRef.current = false;
            }, 500);
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
      // Delay resetting the flag (500ms) so that the new products render and the sentinel moves out of view
      setTimeout(() => {
         loadingRef.current = false;
      }, 500);
   }, [collectionHandle, sortKey, reverse, cursor, hasNextPage, isLoading]);

   useEffect(() => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0]?.isIntersecting && hasNextPage && !loadingRef.current) {
               loadMoreProducts();
            }
         },
         {
            rootMargin: '100px'
         }
      );
      observer.observe(sentinel);
      return () => {
         if (sentinel) {
            observer.unobserve(sentinel);
         }
      };
   }, [loadMoreProducts, hasNextPage]);

   return (
      <>
         <Suspense fallback={<div>Loading products...</div>}>
            <ProductGridItems products={products} groupHandle={collectionHandle} />
         </Suspense>
         {hasNextPage && (
            <div ref={sentinelRef} className="mt-4 text-center">
               {isLoading && <p>Loading more products...</p>}
            </div>
         )}
      </>
   );
}
