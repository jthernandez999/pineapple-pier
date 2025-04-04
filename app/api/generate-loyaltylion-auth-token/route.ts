// app/api/generate-loyaltylion-auth-token/route.ts
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // explicitly Edge compatible

const secretKey = new TextEncoder().encode(process.env.LOYALTYLION_SECRET_KEY!);

export async function POST(req: NextRequest) {
   const { customerId, date } = await req.json();

   if (!customerId || !date) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
   }

   try {
      const token = await new SignJWT({ customerId, date })
         .setProtectedHeader({ alg: 'HS256' })
         .setIssuedAt()
         .setExpirationTime('2h') // Adjust expiration as necessary
         .sign(secretKey);

      return NextResponse.json({ token });
   } catch (error) {
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
   }
}
