// app/api/loyaltylion/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Force this route to run in the Edge Runtime for minimal latency
export const runtime = 'edge';

export async function POST(req: NextRequest) {
   try {
      const { customerId, email, date: clientDate } = (await req.json()) || {};
      if (!customerId || !email) {
         return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
      }

      // Use the provided date if available; otherwise generate a new one
      const date = clientDate || new Date().toISOString();

      // Retrieve secret from server-only env
      const secretKey = process.env.LOYALTY_LION_API_SECRET;
      if (!secretKey) {
         return NextResponse.json({ error: 'LoyaltyLion secret not configured' }, { status: 500 });
      }

      // Concatenate required fields for SHA-1
      const inputString = customerId + date + email + secretKey;

      // Generate the digest using built-in Edge Web Crypto
      const encoder = new TextEncoder();
      const data = encoder.encode(inputString);
      const digestBuffer = await crypto.subtle.digest('SHA-1', data);

      // Convert the digest to a hex string
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const authToken = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

      // Return the date + token
      return NextResponse.json({ date, token: authToken });
   } catch (error) {
      console.error('[LL Debug] Error generating auth token:', error);
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
   }
}
