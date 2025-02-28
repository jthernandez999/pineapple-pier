// /app/api/auth-status/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
   const cookieStore = cookies();
   const token = (await cookieStore).get('shop_customer_token');

   if (token) {
      // Optionally, decode token and return user info.
      return NextResponse.json({
         loggedIn: true,
         user: {
            /* add user info if desired */
         }
      });
   }
   return NextResponse.json({ loggedIn: false });
}
