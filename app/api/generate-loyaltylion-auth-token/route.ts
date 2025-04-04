// app/api/generate-loyaltylion-auth-token/route.ts
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
   const { customerId, date } = await req.json();

   if (!customerId || !date) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
   }

   const secretKey = process.env.LOYALTYLION_SECRET_KEY!;
   const token = crypto
      .createHmac('sha256', secretKey)
      .update(`${customerId}:${date}`)
      .digest('hex');

   return NextResponse.json({ token });
}
