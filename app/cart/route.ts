// app/cart/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
   return NextResponse.json({ message: 'Cart GET endpoint' });
}

export async function POST(request: Request) {
   return NextResponse.json({ message: 'Cart POST endpoint' });
}
