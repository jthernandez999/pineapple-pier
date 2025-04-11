// /app/api/generate-loyaltylion-auth-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
   try {
      const { customerId, email, date: clientDate } = (await req.json()) || {};
      if (!customerId || !email) {
         return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
      }

      const date = clientDate || new Date().toISOString();
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
         return NextResponse.json({ error: 'LoyaltyLion secret not configured' }, { status: 500 });
      }

      const inputString = customerId + date + email + secretKey;
      const encoder = new TextEncoder();
      const data = encoder.encode(inputString);
      const digestBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const authToken = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

      return NextResponse.json({ date, token: authToken });
   } catch (error) {
      console.error('[LL Debug] Error generating auth token:', error);
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
   }
}
