// /app/api/auth-status/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export function GET() {
   // cookies() returns a CookieStore synchronously
   const cookieStore = cookies();
   const token = cookieStore.get('shop_customer_token');

   // Optionally, you could decode the token and check its expiration here
   // so that you don't return loggedIn: true for an expired token.
   if (token) {
      return NextResponse.json({
         loggedIn: true,
         user: {
            // You might include decoded info if desired.
         }
      });
   }
   return NextResponse.json({ loggedIn: false });
}
