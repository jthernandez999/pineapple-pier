import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
   // Await cookies() if it returns a promise in your version
   const cookieStore = await cookies();
   const token = cookieStore.get('shop_customer_token')?.value;
   const secret = process.env.JWT_SECRET;

   if (token && secret) {
      try {
         const decoded = jwt.verify(token, secret);
         return NextResponse.json({
            loggedIn: true,
            user: decoded
         });
      } catch (error) {
         console.error('JWT verification error:', error);
         return NextResponse.json({ loggedIn: false });
      }
   }
   return NextResponse.json({ loggedIn: false });
}
