// app/cart/[[...slug]]/route.ts
import { NextResponse } from 'next/server';

// Handle GET requests
export function GET(request: Request) {
   return NextResponse.json({ message: 'Cart catch-all GET endpoint' });
}

// Handle POST requests (if Shopify or your app uses POST)
export function POST(request: Request) {
   return NextResponse.json({ message: 'Cart catch-all POST endpoint' });
}
