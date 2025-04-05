// app/api/generate-loyaltylion-auth-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Force this route to run in the Edge Runtime
export const runtime = 'edge';

/**
 * LoyaltyLion requires a SHA-1 hash of:
 *   customerId + date + email + NEXT_PUBLIC_LOYALTY_LION_API
 * to authenticate the user.
 */
export async function POST(req: NextRequest) {
   try {
      const { customerId, email } = await req.json();
      if (!customerId || !email) {
         return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
      }

      // Current date (ISO 8601)
      const date = new Date().toISOString();
      const secretKey = process.env.NEXT_PUBLIC_LOYALTY_LION_API!;

      // 1) Concatenate required fields
      const inputString = customerId + date + email + secretKey;

      // 2) Encode
      const encoder = new TextEncoder();
      const data = encoder.encode(inputString);

      // 3) Create a SHA-1 digest with the built-in Edge Web Crypto
      const digestBuffer = await crypto.subtle.digest('SHA-1', data);

      // 4) Convert digest to hex string
      const hashArray = new Uint8Array(digestBuffer);
      const authToken = Array.from(hashArray)
         .map((byte) => byte.toString(16).padStart(2, '0'))
         .join('');

      // Return { date, token } to the client
      return NextResponse.json({ date, token: authToken });
   } catch (error) {
      console.error('Failed to generate LoyaltyLion auth token:', error);
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
   }
}
