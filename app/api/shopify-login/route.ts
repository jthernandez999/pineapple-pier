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
      // Use formData() since the form is submitted as URL-encoded data.
      const formData = await req.formData();
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const rememberMe = formData.get('rememberMe') === 'on';
      const customerAccountApiUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
      const clientId = SHOPIFY_CLIENT_ID;
      const origin = process.env.NEXT_PUBLIC_SHOPIFY_ORIGIN_URL;

      // Log the base URL for debugging

      console.log('customerAccountApiUrl:', customerAccountApiUrl);
      console.log('origin:', origin);

      const loginUrl = new URL(`${customerAccountApiUrl}/oauth/authorize`);

      if (!customerAccountApiUrl || !SHOPIFY_CLIENT_ID || !origin) {
         throw new Error('Required environment variables are not defined.');
      }

      loginUrl.searchParams.set('client_id', clientId || '');
      loginUrl.searchParams.append('response_type', 'code');
      loginUrl.searchParams.append('redirect_uri', `${origin}/authorize`);
      loginUrl.searchParams.set('scope', 'openid email customer-account-api:full');

      // Generate PKCE parameters
      const verifier = await generateCodeVerifier();

      const challenge = await generateCodeChallenge(verifier);
      (await cookies()).set('shop_verifier', verifier as string, {
         // @ts-ignore
         //expires: auth?.expires, //not necessary here
      });
      const state = await generateRandomString();
      const nonce = await generateRandomString();
      (await cookies()).set('shop_state', state as string, {
         // @ts-ignore
         //expires: auth?.expires, //not necessary here
      });
      (await cookies()).set('shop_nonce', nonce as string, {
         // @ts-ignore
         //expires: auth?.expires, //not necessary here
      });
      loginUrl.searchParams.append('state', state);
      loginUrl.searchParams.append('nonce', nonce);
      loginUrl.searchParams.append('code_challenge', challenge);
      loginUrl.searchParams.append('code_challenge_method', 'S256');

      // Revalidate cached customer data if needed.
      revalidateTag(TAGS.customer);
      redirect(`${loginUrl}`);
   } catch (error: any) {
      // If the error is NEXT_REDIRECT, rethrow it so Next.js handles it.
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
         throw error;
      }
      console.error('Shopify login error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
