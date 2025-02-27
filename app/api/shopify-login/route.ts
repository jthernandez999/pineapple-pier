import {
   generateCodeChallenge,
   generateCodeVerifier,
   generateRandomString
} from 'lib/shopify/customer/auth-utils';
import { SHOPIFY_CLIENT_ID, TAGS } from 'lib/shopify/customer/constants';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
   try {
      // Parse form data from a traditional form submission
      const formData = await req.formData();
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      // Checkbox value will be "on" if checked, otherwise null.
      const rememberMe = formData.get('rememberMe') === 'on';

      const customerAccountApiUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
      const origin = process.env.NEXT_PUBLIC_SHOPIFY_ORIGIN_URL;

      if (!customerAccountApiUrl || !SHOPIFY_CLIENT_ID || !origin) {
         throw new Error('Required environment variables are not defined.');
      }

      // Build the OAuth URL for Shopify
      const loginUrl = new URL(`${customerAccountApiUrl}/oauth/authorize`);
      loginUrl.searchParams.set('client_id', SHOPIFY_CLIENT_ID);
      loginUrl.searchParams.append('response_type', 'code');
      loginUrl.searchParams.append('redirect_uri', `${origin}/authorize`);
      loginUrl.searchParams.set('scope', 'openid email customer-account-api:full');

      // Generate PKCE parameters
      const verifier = await generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      // Set cookies for verifier, state, and nonce
      const cookieStore = await cookies();
      cookieStore.set('shop_verifier', verifier, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production'
      });
      const state = await generateRandomString();
      const nonce = await generateRandomString();
      cookieStore.set('shop_state', state, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production'
      });
      cookieStore.set('shop_nonce', nonce, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production'
      });

      // Append additional OAuth parameters
      loginUrl.searchParams.append('state', state);
      loginUrl.searchParams.append('nonce', nonce);
      loginUrl.searchParams.append('code_challenge', challenge);
      loginUrl.searchParams.append('code_challenge_method', 'S256');

      // Revalidate cached customer data if needed
      revalidateTag(TAGS.customer);

      // Redirect the user's browser to Shopify's OAuth login page.
      return redirect(loginUrl.toString());
   } catch (error: any) {
      // Let NEXT_REDIRECT errors propagate
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
         throw error;
      }
      console.error('Shopify login error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
