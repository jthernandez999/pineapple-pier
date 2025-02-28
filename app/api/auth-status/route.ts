import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is defined in your environment

export async function GET() {
   const cookieStore = await cookies();
   const token = cookieStore.get('shop_customer_token')?.value;

   if (token && JWT_SECRET) {
      try {
         const decoded = jwt.verify(token, JWT_SECRET);
         return NextResponse.json({
            loggedIn: true,
            user: decoded
         });
      } catch (error) {
         console.error('JWT validation error:', error);
         return NextResponse.json({ loggedIn: false });
      }
   }
   return NextResponse.json({ loggedIn: false });
}
