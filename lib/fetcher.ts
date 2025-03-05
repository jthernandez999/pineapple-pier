// lib/fetcher.ts
export async function fetcher(url: string, query: string, variables: any) {
   try {
      const res = await fetch(url, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token':
               process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
         },
         body: JSON.stringify({ query, variables }),
         next: { revalidate: 60 } // if using Next.js caching
      });
      if (!res.ok) {
         console.error('Network response was not ok', res.status, res.statusText);
         throw new Error(`Network response was not ok ${res.statusText}`);
      }
      const json = await res.json();
      if (json.errors) {
         console.error('GraphQL errors:', json.errors);
         throw new Error('GraphQL error');
      }
      return json;
   } catch (error) {
      console.error('Error in fetcher:', error);
      throw error;
   }
}
