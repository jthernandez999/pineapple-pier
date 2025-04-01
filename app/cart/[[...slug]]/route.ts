// app/cart/[[...slug]]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(
   request: NextRequest,
   context: { params: { slug?: string[] } }
): Promise<Response> {
   const { slug } = context.params;
   if (!slug || slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint' });
   }
   return NextResponse.json({ message: `Cart nested endpoint: ${slug.join('/')}` });
}

export async function POST(
   request: NextRequest,
   context: { params: { slug?: string[] } }
): Promise<Response> {
   const { slug } = context.params;
   if (!slug || slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint (POST)' });
   }
   return NextResponse.json({ message: `Cart nested endpoint (POST): ${slug.join('/')}` });
}
