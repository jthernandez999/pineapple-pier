import { NextRequest, NextResponse } from 'next/server';

// Force this route to run in the Edge Runtime
export const runtime = 'edge';

/**
 * LoyaltyLion requires a SHA‑1 hash of:
 *   customerId + date + email + NEXT_PUBLIC_LOYALTY_LION_API
 * to authenticate the user.
 */
export async function POST(req: NextRequest) {
   try {
      // Extract customerId, email, and optionally date from the request body.
      const { customerId, email, date: clientDate } = await req.json();
      if (!customerId || !email) {
         return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 });
      }

      // Use the provided date if available; otherwise generate a current ISO timestamp.
      const date = clientDate || new Date().toISOString();

      // Retrieve the LoyaltyLion secret key from your environment variables.
      const secretKey = process.env.NEXT_PUBLIC_LOYALTY_LION_API;
      if (!secretKey) {
         return NextResponse.json({ error: 'LoyaltyLion secret not configured' }, { status: 500 });
      }

      // Concatenate the required fields.
      const inputString = customerId + date + email + secretKey;

      // Encode the input string.
      const encoder = new TextEncoder();
      const data = encoder.encode(inputString);

      // Generate a SHA‑1 digest using the built‑in Edge Web Crypto API.
      const digestBuffer = await crypto.subtle.digest('SHA-1', data);

      // Convert the digest to a hex string.
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const authToken = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

      // Return both the date and token so they match on the client.
      return NextResponse.json({ date, token: authToken });
   } catch (error) {
      console.error('Failed to generate LoyaltyLion auth token:', error);
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
   }
}
