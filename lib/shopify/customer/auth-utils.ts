// @ts-nocheck
export async function generateCodeVerifier() {
   const randomCode = generateRandomCode();
   return base64UrlEncode(randomCode);
}
export async function generateCodeChallenge(codeVerifier: string) {
   const digestOp = await crypto.subtle.digest(
      { name: 'SHA-256' },
      new TextEncoder().encode(codeVerifier)
   );
   const hash = convertBufferToString(digestOp);
   return base64UrlEncode(hash);
}
function generateRandomCode() {
   const array = new Uint8Array(32);
   crypto.getRandomValues(array);
   return String.fromCharCode.apply(null, Array.from(array));
}
function base64UrlEncode(str: string) {
   const base64 = btoa(str);
   // This is to ensure that the encoding does not have +, /, or = characters in it.
   return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function convertBufferToString(hash: ArrayBuffer) {
   const uintArray = new Uint8Array(hash);
   const numberArray = Array.from(uintArray);
   return String.fromCharCode(...numberArray);
}

export async function generateRandomString() {
   const timestamp = Date.now().toString();
   const randomString = Math.random().toString(36).substring(2);
   return timestamp + randomString;
}

export async function getNonce(token: string) {
   return decodeJwt(token).payload.nonce;
}
function decodeJwt(token: string) {
   const [header, payload, signature] = token.split('.');
   const decodedHeader = JSON.parse(atob(header || ''));
   const decodedPayload = JSON.parse(atob(payload || ''));
   return {
      header: decodedHeader,
      payload: decodedPayload,
      signature
   };
}

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
} from './pkce-utils';

export async function buildShopifyAuthUrl(): Promise<string> {
   // Construct the base URL from your authentication endpoint.
   const authUrl = new URL(`${SHOPIFY_CUSTOMER_ACCOUNT_API_URL}/oauth/authorize`);

   // Append required parameters.
   authUrl.searchParams.append('client_id', SHOPIFY_CLIENT_ID);
   authUrl.searchParams.append('response_type', 'code');
   authUrl.searchParams.append('redirect_uri', `${SHOPIFY_ORIGIN_URL}/authorize`);
   authUrl.searchParams.append('scope', 'openid email customer-account-api:full');

   // Generate security parameters.
   const state = await generateState();
   const nonce = await generateNonce(32);
   authUrl.searchParams.append('state', state);
   authUrl.searchParams.append('nonce', nonce);

   // PKCE: Generate the code verifier and challenge.
   const codeVerifier = await generateCodeVerifier();
   const codeChallenge = await generateCodeChallenge(codeVerifier);

   // Store the code verifier securely (e.g., in an HTTP-only cookie).
   // For example: setCookie('shop_verifier', codeVerifier);

   authUrl.searchParams.append('code_challenge', codeChallenge);
   authUrl.searchParams.append('code_challenge_method', 'S256');

   return authUrl.toString();
}
