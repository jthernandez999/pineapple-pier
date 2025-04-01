// app/cart/[[...slug]]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(
   request: NextRequest,
   { params }: { params: { slug: string[] } }
): Promise<Response> {
   if (params.slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint' });
   }
   return NextResponse.json({ message: `Cart nested endpoint: ${params.slug.join('/')}` });
}

export async function POST(
   request: NextRequest,
   { params }: { params: { slug: string[] } }
): Promise<Response> {
   if (params.slug.length === 0) {
      return NextResponse.json({ message: 'Cart root endpoint (POST)' });
   }
   return NextResponse.json({ message: `Cart nested endpoint (POST): ${params.slug.join('/')}` });
}
