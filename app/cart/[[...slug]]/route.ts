// app/cart/[[...slug]]/route.ts
import { NextResponse } from 'next/server';

export function GET(request: Request, { params }: { params: { slug?: string[] } }) {
   // When slug is undefined or empty, this is the `/cart` route
   if (!params.slug || params.slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint' });
   }
   // For any nested route, handle accordingly
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
