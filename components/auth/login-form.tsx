'use client';

import clsx from 'clsx';
import {
   SHOPIFY_CLIENT_ID,
   SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
   SHOPIFY_ORIGIN_URL
} from 'lib/shopify/customer/constants';
import {
   generateCodeChallenge,
   generateCodeVerifier,
   generateNonce,
   generateState
} from 'lib/shopify/customer/pkce-utils';
import { useState } from 'react';

export function LoginShopify() {
   const [authUrl, setAuthUrl] = useState<string>('');
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   async function buildAuthUrl() {
      try {
         const url = new URL(`${SHOPIFY_CUSTOMER_ACCOUNT_API_URL}/oauth/authorize`);
         url.searchParams.append('client_id', SHOPIFY_CLIENT_ID!);
         url.searchParams.append('response_type', 'code');
         url.searchParams.append('redirect_uri', `${SHOPIFY_ORIGIN_URL}/authorize`);
         url.searchParams.append('scope', 'openid email customer-account-api:full');

         const state = await generateState();
         url.searchParams.append('state', state);

         const nonce = await generateNonce(32);
         url.searchParams.append('nonce', nonce);

         const codeVerifier = await generateCodeVerifier();
         const codeChallenge = await generateCodeChallenge(codeVerifier);
         // IMPORTANT: Store the codeVerifier securely (e.g. in an HTTP-only cookie) for later token exchange.
         url.searchParams.append('code_challenge', codeChallenge);
         url.searchParams.append('code_challenge_method', 'S256');

         return url.toString();
      } catch (error) {
         console.error('Error building auth URL:', error);
         throw error;
      }
   }

   async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setLoading(true);
      try {
         const url = await buildAuthUrl();
         setAuthUrl(url);
         // Redirect to Shopify's OAuth login.
         window.location.href = url;
      } catch (error) {
         setErrorMessage('Failed to initiate login. Please try again.');
         setLoading(false);
      }
   }

   return (
      <form onSubmit={handleSignIn}>
         {errorMessage && <div className="my-5 text-red-600">{errorMessage}</div>}
         <button
            type="submit"
            aria-label="Log in"
            disabled={loading}
            className={clsx(
               'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white',
               {
                  'cursor-not-allowed opacity-60': loading,
                  'hover:opacity-90': !loading
               }
            )}
         >
            {loading ? 'Logging In...' : 'Log In'}
         </button>
      </form>
   );
}
