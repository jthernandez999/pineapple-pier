// app/cart/[[...slug]]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ParsedUrlQuery } from 'querystring';

export async function GET(
   request: NextRequest,
   context: { params: ParsedUrlQuery }
): Promise<Response> {
   // Extract "slug" from the params. It may be a string or an array.
   const { slug } = context.params;
   const slugArr = Array.isArray(slug) ? slug : slug ? [slug] : []; // If slug is not provided, default to an empty array

   if (slugArr.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint' });
   }
   return NextResponse.json({
      message: `Cart nested endpoint: ${slugArr.join('/')}`
   });
}

export async function POST(
   request: NextRequest,
   context: { params: ParsedUrlQuery }
): Promise<Response> {
   const { slug } = context.params;
   const slugArr = Array.isArray(slug) ? slug : slug ? [slug] : [];
   if (slugArr.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint (POST)' });
   }
   return NextResponse.json({
      message: `Cart nested endpoint (POST): ${slugArr.join('/')}`
   });
}
