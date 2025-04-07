import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
//import { revalidateTag } from 'next/cache';
import { parseJSON } from 'lib/shopify/customer/utils/parse-json';
import { isShopifyError } from 'lib/type-guards';
import {
   checkExpires,
   createAllCookies,
   initialAccessToken,
   removeAllCookies
} from './auth-helpers';
import {
   SHOPIFY_CLIENT_ID,
   SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
   SHOPIFY_CUSTOMER_API_VERSION,
   SHOPIFY_ORIGIN,
   SHOPIFY_USER_AGENT
} from './constants';
// lib/shopify/customer/index.ts
import { cookies } from 'next/headers';

/**
 * Fetch a LoyaltyLion auth token for a given customer.
 *
 * @param customerId - The customer's Shopify ID.
 * @param email - The customer's email address.
 * @param date - The ISO 8601 timestamp to use for token generation.
 * @returns A promise that resolves to the LoyaltyLion auth token (string).
 */
export async function getAuthToken(
   customerId: string,
   email: string,
   date: string
): Promise<string> {
   const fetchUrl = `https://dearjohndenim.com/api/generate-loyaltylion-auth-token`;

   const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, email, date })
   });

   if (!response.ok) {
      throw new Error('Failed to generate loyaltylion auth token');
   }

   const { token } = await response.json();
   return token;
}

/**
 * Retrieve the authenticated user.
 *
 * First, it checks for cookies set by your middleware (loyalty_lion_id and loyalty_lion_email).
 * If not found, it uses the shop_customer_token (assumed to be the Shopify customer access token)
 * to query Shopify for the customer's details.
 *
 * @returns An object with { id, email } or null if not found.
 */
export async function getAuthenticatedUser() {
   const cookieStore = await cookies();

   // Try middleware-set cookies first.
   const loyaltyIdCookie = cookieStore.get('loyalty_lion_id');
   const loyaltyEmailCookie = cookieStore.get('loyalty_lion_email');
   if (loyaltyIdCookie && loyaltyEmailCookie) {
      return { id: loyaltyIdCookie.value, email: loyaltyEmailCookie.value };
   }

   // Fallback: use shop_customer_token as the Shopify customer access token.
   const tokenCookie = cookieStore.get('shop_customer_token');
   if (!tokenCookie) return null;
   const customerAccessToken = tokenCookie.value;
   if (!customerAccessToken) return null;

   // Try to decode the token for basic info.
   try {
      const parts = customerAccessToken.split('.');
      if (parts.length >= 2 && parts[1]) {
         const payloadBase64 = parts[1];
         const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
         const payload = JSON.parse(payloadJson);
         // If the token payload includes an emailAddress, use it.
         if (payload.emailAddress) {
            return { id: payload.accountNumber || payload.sub, email: payload.emailAddress };
         }
      }
   } catch (e) {
      console.error('DEBUG: Failed to decode token:', e);
      // Fall through to querying Shopify.
   }

   // If email wasn't available in the token, query Shopify.
   // The token is already sent in the header, so no argument is needed.
   const query = `
   query GetCustomer {
     customer {
       id
       emailAddress {
         email
       }
     }
   }
 `;
   try {
      const result = await shopifyCustomerFetch<{
         customer: { id: string; emailAddress: { value: string } };
      }>({
         customerToken: customerAccessToken,
         query
      });
      if (result.body?.customer?.emailAddress?.value) {
         return { id: result.body.customer.id, email: result.body.customer.emailAddress.value };
      }
      return null;
   } catch (error) {
      console.error(
         'DEBUG: Failed to fetch customer details from Shopify:',
         JSON.stringify(error, null, 2)
      );
      return null;
   }
}

type ExtractVariables<T> = T extends { variables: object } ? T['variables'] : never;
const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
const userAgent = SHOPIFY_USER_AGENT;
// const customerEndpoint = `${customerAccountApiUrl}/account/customer/api/${apiVersion}/graphql`;
const customerEndpoint = 'https://shopify.com/10242207/account/customer/api/2025-01/graphql';

//NEVER CACHE THIS! Doesn't see to be cached anyway b/c
//https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#opting-out-of-data-caching
//The fetch request comes after the usage of headers or cookies.
//and we always send this anyway after getting a cookie for the customer
export async function shopifyCustomerFetch<T, V = {}>({
   cache = 'no-store',
   customerToken,
   query,
   tags,
   variables
}: {
   cache?: RequestCache;
   customerToken: string;
   query: string;
   tags?: string[];
   variables?: V;
}): Promise<{ status: number; body: T }> {
   try {
      const customerOrigin = SHOPIFY_ORIGIN;
      const result = await fetch(customerEndpoint, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
            Origin: customerOrigin!,
            Authorization: customerToken
         },
         body: JSON.stringify({
            ...(query && { query }),
            ...(variables && { variables })
         }),
         cache: 'no-store',
         ...(tags && { next: { tags } })
      });

      const body = await result.json();

      if (!result.ok) {
         if (result.status === 401) {
            throw new Error('unauthorized');
         }
         let errors;
         try {
            errors = parseJSON(body);
         } catch (_e) {
            errors = [{ message: body }];
         }
         throw errors;
      }

      if (body.errors) {
         throw body.errors[0];
      }

      return {
         status: result.status,
         body
      };
   } catch (e) {
      if (isShopifyError(e)) {
         throw {
            cause: e.cause?.toString() || 'unknown',
            status: e.status || 500,
            message: e.message,
            query
         };
      }
      throw { error: e, query };
   }
}

// Define an interface for the expected result from checkExpires
interface CheckExpiresResponse {
   ranRefresh: boolean;
   refresh?: {
      success: boolean;
      data: {
         customerAccessToken: string;
         expires_in: number;
         refresh_token: string;
      };
   };
}

export async function isLoggedIn(request: NextRequest, origin: string) {
   const customerToken = request.cookies.get('shop_customer_token');
   const refreshToken = request.cookies.get('shop_refresh_token');
   const expiresToken = request.cookies.get('shop_expires_at');
   const newHeaders = new Headers(request.headers);

   // If neither token exists, you're basically a stranger.
   if (!customerToken && !refreshToken) {
      // console.log('No tokens found. Redirecting to origin and clearing cookies.');
      const redirectUrl = new URL(origin);
      const response = NextResponse.redirect(redirectUrl);
      return removeAllCookies(response);
   }

   // If there's no expiration info, how is the bouncer supposed to know when to kick you out?
   if (!expiresToken) {
      // console.log('No expiration info found. Redirecting and clearing cookies.');
      const redirectUrl = new URL(origin);
      const response = NextResponse.redirect(redirectUrl);
      return removeAllCookies(response);
   }

   // Check if the token is expired or if we need a refresh.
   // We're assuming checkExpires returns a CheckExpiresResponse.
   const isExpired = (await checkExpires({
      request,
      expiresAt: expiresToken.value,
      origin
   })) as CheckExpiresResponse;
   // console.log('isExpired result:', isExpired);

   // If a refresh was attempted...
   if (isExpired.ranRefresh) {
      // ...and it failed, then you're not getting in.
      if (!isExpired.refresh || !isExpired.refresh.success) {
         // console.log('Token refresh failed. Redirecting and clearing cookies.');
         const redirectUrl = new URL(origin);
         const response = NextResponse.redirect(redirectUrl);
         return removeAllCookies(response);
      } else {
         // Otherwise, refresh worked. Reset your cookies.
         const refreshData = isExpired.refresh.data;
         const newCustomerAccessToken = refreshData.customerAccessToken;
         const expires_in = refreshData.expires_in;
         // Set a new expiration timestamp, giving a 120-second grace period.
         const expiresAt = (new Date().getTime() + (expires_in - 120) * 1000).toString();
         // console.log('Token refreshed successfully. Resetting cookies with new token.');
         newHeaders.set('x-shop-customer-token', newCustomerAccessToken);
         const resetCookieResponse = NextResponse.next({
            request: {
               headers: newHeaders
            }
         });
         return await createAllCookies({
            response: resetCookieResponse,
            customerAccessToken: newCustomerAccessToken,
            expires_in,
            refresh_token: refreshData.refresh_token,
            expiresAt
         });
      }
   }

   // If not expired (or no refresh was needed), just let you pass.
   // console.log('Token is still valid. Proceeding with existing token.');
   // Since we already checked the existence of the token above, we can assert it's defined.
   newHeaders.set('x-shop-customer-token', customerToken!.value);
   return NextResponse.next({
      request: {
         headers: newHeaders
      }
   });
}

export const SHOPIFY_ORIGIN_URL = process.env.NEXT_PUBLIC_SHOPIFY_ORIGIN_URL;

export function getOrigin(request: NextRequest) {
   const nextOrigin = request.nextUrl.origin;
   // For localhost, you might want to use a different origin:
   if (nextOrigin === 'https://localhost:3000' || nextOrigin === 'http://localhost:3000') {
      return SHOPIFY_ORIGIN_URL!;
   }
   // Otherwise, always use the env var value:
   return SHOPIFY_ORIGIN_URL!;
}

// //when we are running on the production website we just get the origin from the request.nextUrl
// export function getOrigin(request: NextRequest) {
//    const nextOrigin = request.nextUrl.origin;
//    //console.log("Current Origin", nextOrigin)
//    //when running localhost, we want to use fake origin otherwise we use the real origin
//    let newOrigin = nextOrigin;
//    if (nextOrigin === 'https://localhost:3000' || nextOrigin === 'http://localhost:3000') {
//       newOrigin = SHOPIFY_ORIGIN!;
//    } else {
//       newOrigin = nextOrigin;
//    }
//    return newOrigin;
// }

export async function authorizeFn(request: NextRequest, origin: string) {
   const clientId = SHOPIFY_CLIENT_ID;
   const newHeaders = new Headers(request.headers);

   // Step 1: Get tokens using the initial access token flow..
   const dataInitialToken = await initialAccessToken(
      request,
      origin,
      SHOPIFY_CUSTOMER_ACCOUNT_API_URL!,
      clientId!
   );
   if (!dataInitialToken.success) {
      console.error('Error: Access Denied. Check logs', dataInitialToken.message);
      newHeaders.set('x-shop-access', 'denied');
      return NextResponse.next({
         request: { headers: newHeaders }
      });
   }
   // Use tokens directly from the initial token response.
   const { access_token, expires_in, id_token, refresh_token } = dataInitialToken.data;
   // Mark access as allowed.
   newHeaders.set('x-shop-access', 'allowed');
   const accountUrl = new URL(`${origin}/account`);
   const authResponse = NextResponse.redirect(accountUrl);

   // Set the shop_access cookie to "allowed".
   authResponse.cookies.set('shop_access', 'allowed', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 7200
   });

   // Compute an expiresAt value (2 minutes before token expiry)
   const expiresAt = new Date(Date.now() + (expires_in! - 120) * 1000).getTime() + '';

   // Set remaining session cookies.
   const finalResponse = await createAllCookies({
      response: authResponse,
      customerAccessToken: access_token,
      expires_in,
      refresh_token,
      expiresAt,
      id_token
   });

   // Ensure shop_access cookie is present on the final response.
   finalResponse.cookies.set('shop_access', 'allowed', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 7200
   });

   return finalResponse;
}

export async function logoutFn(request: NextRequest, origin: string) {
   // Get the id_token from cookies
   const idToken = request.cookies.get('shop_id_token')?.value;

   // If no id_token exists, clear cookies and redirect to login
   if (!idToken) {
      const response = NextResponse.redirect(`${origin}/login`);
      return removeAllCookies(response);
   }

   // Build the Shopify logout URL.
   const logoutUrl = new URL(`${SHOPIFY_CUSTOMER_ACCOUNT_API_URL}/logout`);
   logoutUrl.searchParams.set('id_token_hint', idToken);
   logoutUrl.searchParams.set('post_logout_redirect_uri', origin);

   // Redirect to Shopify's logout endpoint.
   const response = NextResponse.redirect(logoutUrl);

   // Remove all authentication cookies.
   const responseCleared = removeAllCookies(response);

   // When the browser follows the redirect, Shopify should logout the user
   // and then redirect back to your site (using the post_logout_redirect_uri).
   // Once back on your site, your middleware (or client logic) will see no valid token
   // and will remove any lingering accountNumber query parameter.
   return responseCleared;
}
