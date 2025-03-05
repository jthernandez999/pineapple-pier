// app/api/collection-products/route.ts (Next.js 13+)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
   try {
      const { query, variables } = await request.json();
      const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token':
               process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
         },
         body: JSON.stringify({ query, variables }),
         next: { revalidate: 60 }
      });

      const json = await res.json();
      return NextResponse.json(json);
   } catch (error: any) {
      console.error('Error in collection-products API:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
