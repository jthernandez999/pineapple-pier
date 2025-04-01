// app/cart/route.ts
import { NextResponse } from 'next/server';

// Handle GET requests to /cart
export function GET(request: Request) {
   return NextResponse.json({ message: 'Cart GET endpoint' });
}

// Handle POST requests to /cart (if needed)
export function POST(request: Request) {
   return NextResponse.json({ message: 'Cart POST endpoint' });
}
