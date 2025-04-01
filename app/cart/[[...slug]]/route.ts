// app/cart/[[...slug]]/route.ts
import { NextResponse } from 'next/server';

export function GET(request: Request, { params }: { params: { slug?: string[] } }) {
   // If no slug is provided, this is the root /cart route.
   if (!params.slug || params.slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint' });
   }
   // Handle nested routes like /cart/c/...
   return NextResponse.json({
      message: `Cart nested endpoint: ${params.slug.join('/')}`
   });
}

export function POST(request: Request, { params }: { params: { slug?: string[] } }) {
   if (!params.slug || params.slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint (POST)' });
   }
   return NextResponse.json({
      message: `Cart nested endpoint (POST): ${params.slug.join('/')}`
   });
}
