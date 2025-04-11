import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
   let parsed;
   try {
      // Read the raw body as text.
      const text = await req.text();
      if (!text) {
         console.error('[LL Debug] Empty request body received.');
         return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      parsed = JSON.parse(text);
   } catch (err) {
      console.error('[LL Debug] Error parsing request body:', err);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
   }

   const { customerId, email, date: clientDate } = parsed || {};
   if (!customerId || !email) {
      return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
   }

   const date = clientDate || new Date().toISOString();
   const secretKey = process.env.NEXT_PUBLIC_LOYALTY_LION_API;
   if (!secretKey) {
      console.error('[LL Debug] NEXT_PUBLIC_LOYALTY_LION_API is not set');
      return NextResponse.json({ error: 'LoyaltyLion secret not configured' }, { status: 500 });
   }

   try {
      const inputString = customerId + date + email + secretKey;
      console.log('[LL Debug] inputString:', inputString);

      const encoder = new TextEncoder();
      const data = encoder.encode(inputString);
      const digestBuffer = await crypto.subtle.digest('SHA-1', data);
      console.log('[LL Debug] digestBuffer byte length:', digestBuffer.byteLength);

      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const authToken = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

      return NextResponse.json({ date, token: authToken });
   } catch (error) {
      console.error('[LL Debug] Error generating auth token:', error);
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
   }
}
