// lib/useProducts.ts

import useSWRInfinite from 'swr/infinite';
import { fetcher } from './fetcher';
import { getCollectionProductsQuery } from './shopify/queries/collection';

interface CollectionVariables {
   handle: string;
   sortKey: string;
   reverse: boolean;
   cursor?: string;
}

export function useProducts(collectionHandle: string, sortKey: string, reverse: boolean) {
   // The key is a tuple: [url, query, variables]
   const getKey = (
      pageIndex: number,
      previousPageData: any
   ): [string, string, CollectionVariables] | null => {
      if (previousPageData && !previousPageData.collection.products.pageInfo.hasNextPage) {
         return null; // reached the end
      }
      const variables: CollectionVariables = {
         handle: collectionHandle,
         sortKey,
         reverse,
         cursor:
            pageIndex === 0 ? undefined : previousPageData.collection.products.pageInfo.endCursor
      };
      return [
         process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '',
         getCollectionProductsQuery,
         variables
      ];
   };

   const { data, error, size, setSize } = useSWRInfinite(
      getKey,
      (url: string, query: string, variables: CollectionVariables) => fetcher(url, query, variables)
   );

   const products =
      data?.flatMap((page) => page.collection.products.edges.map((edge: any) => edge.node)) || [];
   const hasNextPage = data
      ? data[data.length - 1].collection.products.pageInfo.hasNextPage
      : false;

   return { products, error, hasNextPage, size, setSize };
}
