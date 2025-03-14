// components/hooks/useMetaobject.ts
import { useEffect, useState } from 'react';

interface MetaobjectField {
   key: string;
   value: string;
}

export interface MetaobjectData {
   id: string;
   handle: string;
   fields: MetaobjectField[];
}

export function useMetaobject(metaobjectId: string): MetaobjectData | null {
   const [metaobject, setMetaobject] = useState<MetaobjectData | null>(null);

   useEffect(() => {
      async function fetchMetaobject() {
         const query = `
        query GetColorMetaobject($id: ID!) {
          metaobject(id: $id) {
            id
            handle
            fields {
              key
              value
            }
          }
        }
      `;
         const variables = { id: metaobjectId };
         try {
            const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT!, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token':
                     process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!
               },
               body: JSON.stringify({ query, variables }),
               // Use Next.js caching: cache the response and revalidate every 60 seconds.
               next: { revalidate: 60 }
            });
            const data = await res.json();
            // console.log('Metaobject response:', data);
            setMetaobject(data.data.metaobject);
         } catch (error) {
            console.error('Error fetching metaobject:', error);
         }
      }
      if (metaobjectId) {
         fetchMetaobject();
      }
   }, [metaobjectId]);

   // console.log('metaobject', metaobject);
   return metaobject;
}
