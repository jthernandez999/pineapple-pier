// @ts-nocheck
// Import your constants
import {
   SHOPIFY_CLIENT_ID,
   SHOPIFY_CUSTOMER_ACCOUNT_API_URL
} from 'lib/shopify/customer/constants';

/**
 * buildShopifyAuthUrl constructs the Shopify OAuth authorization URL
 * following the documentation for public clients using PKCE.
 */
export async function buildShopifyAuthUrl(): Promise<string> {
   try {
      const authUrl = new URL(`${SHOPIFY_CUSTOMER_ACCOUNT_API_URL}/oauth/authorize`);
      authUrl.searchParams.append('client_id', SHOPIFY_CLIENT_ID);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', `${SHOPIFY_ORIGIN_URL}/authorize`);
      authUrl.searchParams.append('scope', 'openid email customer-account-api:full');

      const state = await generateState();
      authUrl.searchParams.append('state', state);

      const nonce = await generateNonce(32);
      authUrl.searchParams.append('nonce', nonce);

      const codeVerifier = await generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // You must store the codeVerifier securely for later use (e.g., in a cookie).
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');

      return authUrl.toString();
   } catch (error) {
      console.error('buildShopifyAuthUrl failed:', error);
      throw error;
   }
}

// PKCE Utility Functions
export async function generateCodeVerifier(): Promise<string> {
   const randomCode = generateRandomCode();
   return base64UrlEncode(randomCode);
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
   const digestOp = await crypto.subtle.digest(
      { name: 'SHA-256' },
      new TextEncoder().encode(codeVerifier)
   );
   const hash = convertBufferToString(digestOp);
   return base64UrlEncode(hash);
}

function generateRandomCode(): string {
   const array = new Uint8Array(32);
   crypto.getRandomValues(array);
   return String.fromCharCode(...array);
}

function base64UrlEncode(str: string): string {
   const base64 = btoa(str);
   // Replace characters to make the result URL-safe.
   return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function convertBufferToString(hash: ArrayBuffer): string {
   const uintArray = new Uint8Array(hash);
   return String.fromCharCode(...uintArray);
}

export async function generateRandomString(): Promise<string> {
   const timestamp = Date.now().toString();
   const randomString = Math.random().toString(36).substring(2);
   return timestamp + randomString;
}

export async function generateState(): Promise<string> {
   return generateRandomString();
}

export async function generateNonce(length: number): Promise<string> {
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let nonce = '';
   for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      nonce += characters.charAt(randomIndex);
   }
   return nonce;
}

export async function getNonce(token: string): Promise<string> {
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
