// lib/graphqlClient.ts
export async function graphQLClient(query: string, variables: any) {
   const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT as string, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-Shopify-Storefront-Access-Token': process.env
            .NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN as string
      },
      body: JSON.stringify({ query, variables }),
      // This instructs Next.js to cache the response at the edge and revalidate every 60 seconds.
      next: { revalidate: 60 }
   });

   if (!res.ok) {
      throw new Error(`HTTP error: ${res.statusText}`);
   }

   const json = await res.json();
   if (json.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
   }
   return json.data;
}
