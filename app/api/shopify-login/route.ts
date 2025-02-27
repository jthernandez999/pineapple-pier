import {
   generateCodeChallenge,
   generateCodeVerifier,
   generateRandomString
} from 'lib/shopify/customer/auth-utils';
import { SHOPIFY_CLIENT_ID, TAGS } from 'lib/shopify/customer/constants';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
   // Parse request data (if you need email/password, they're available here)
   const { email, password, rememberMe } = await req.json();

   const customerAccountApiUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
   const clientId = SHOPIFY_CLIENT_ID;
   const origin = process.env.NEXT_PUBLIC_SHOPIFY_ORIGIN_URL;

   if (!customerAccountApiUrl || !clientId || !origin) {
      throw new Error('Required environment variables are not defined.');
   }

   // Build the OAuth URL
   const loginUrl = new URL(`${customerAccountApiUrl}/oauth/authorize`);
   loginUrl.searchParams.set('client_id', clientId);
   loginUrl.searchParams.append('response_type', 'code');
   loginUrl.searchParams.append('redirect_uri', `${origin}/authorize`);
   loginUrl.searchParams.set('scope', 'openid email customer-account-api:full');

   // Generate PKCE code verifier and challenge
   const verifier = await generateCodeVerifier();
   const challenge = await generateCodeChallenge(verifier);

   // Set cookies with PKCE and state info
   const cookieStore = cookies();
   (await cookieStore).set('shop_verifier', verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
   });
   const state = await generateRandomString();
   const nonce = await generateRandomString();
   (await cookieStore).set('shop_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
   });
   (await cookieStore).set('shop_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
   });

   // Append additional OAuth parameters
   loginUrl.searchParams.append('state', state);
   loginUrl.searchParams.append('nonce', nonce);
   loginUrl.searchParams.append('code_challenge', challenge);
   loginUrl.searchParams.append('code_challenge_method', 'S256');

   // Revalidate any customer cache if needed
   revalidateTag(TAGS.customer);

   // Redirect the user's browser to Shopify's OAuth login page.
   // This redirect call will throw a special NEXT_REDIRECT error,
   // which Next.js handles internally.
   return redirect(loginUrl.toString());
}
