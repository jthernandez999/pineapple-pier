// pages/api/auth-status.ts (or app/api/auth-status/route.ts for Next.js 13+)
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
   const cookieStore = await cookies();
   const token = cookieStore.get('shop_customer_token')?.value;

   // Optionally verify the token or decode it here if needed.
   const loggedIn = Boolean(token);

   return NextResponse.json({
      loggedIn,
      user: loggedIn
         ? {
              /* decode token or fetch user info here */
           }
         : null
   });
}
