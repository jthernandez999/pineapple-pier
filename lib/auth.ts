// lib/auth.ts
import { cookies } from 'next/headers';

export async function getLoggedInStatus(): Promise<boolean> {
   const cookieStore = cookies();
   // We're assuming that after login, a non-httpOnly cookie "loggedIn" is set to "true"
   const loggedInCookie = (await cookieStore).get('loggedIn');
   return loggedInCookie?.value === 'true';
}
