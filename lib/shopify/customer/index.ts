import { parseJSON } from 'lib/shopify/customer/utils/parse-json';
import { isShopifyError } from 'lib/type-guards';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
   checkExpires,
   createAllCookies,
   exchangeAccessToken,
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

type ExtractVariables<T> = T extends { variables: object } ? T['variables'] : never;
const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
const userAgent = SHOPIFY_USER_AGENT;
const customerEndpoint = `${customerAccountApiUrl}/account/customer/api/${apiVersion}/graphql`;
const clientId = SHOPIFY_CLIENT_ID;
/**
 * Executes a GraphQL fetch against the Shopify Customer API.
 */
export async function shopifyCustomerFetch<T>({
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
   variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T }> {
   try {
      const customerOrigin = SHOPIFY_ORIGIN;
      const result = await fetch(customerEndpoint, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
            Origin: customerOrigin,
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
         console.error('Error in Customer Fetch Status', body.errors);
         if (result.status === 401) {
            throw 'unauthorized';
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
         console.error('Error in Customer Fetch', body.errors[0]);
         throw body.errors[0];
      }

      return { status: result.status, body };
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

/**
 * Checks if a customer is logged in by verifying tokens and, if necessary, refreshing them.
 */
export async function isLoggedIn(request: NextRequest, origin: string) {
   const customerToken = request.cookies.get('shop_customer_token')?.value;
   const refreshToken = request.cookies.get('shop_refresh_token')?.value;
   const newHeaders = new Headers(request.headers);

   if (!customerToken && !refreshToken) {
      const redirectUrl = new URL(origin);
      const response = NextResponse.redirect(`${redirectUrl}`);
      return removeAllCookies(response);
   }

   const expiresToken = request.cookies.get('shop_expires_at')?.value;
   if (!expiresToken) {
      const redirectUrl = new URL(origin);
      const response = NextResponse.redirect(`${redirectUrl}`);
      return removeAllCookies(response);
   }

   const expirationCheck = await checkExpires({
      request,
      expiresAt: expiresToken,
      origin
   });
   console.log('is Expired?', expirationCheck);

   if (expirationCheck.ranRefresh) {
      if (!expirationCheck.refresh?.success) {
         const redirectUrl = new URL(origin);
         const response = NextResponse.redirect(`${redirectUrl}`);
         return removeAllCookies(response);
      } else {
         const refreshData = expirationCheck.refresh.data;
         console.log('Using refresh token to reset cookies');
         const newCustomerAccessToken = refreshData?.customerAccessToken;
         const expires_in = refreshData?.expires_in;
         const expiresAt =
            new Date(new Date().getTime() + (expires_in! - 120) * 1000).getTime() + '';
         newHeaders.set('x-shop-customer-token', newCustomerAccessToken);
         const resetCookieResponse = NextResponse.next({ request: { headers: newHeaders } });
         return await createAllCookies({
            response: resetCookieResponse,
            customerAccessToken: newCustomerAccessToken,
            expires_in,
            refresh_token: refreshData?.refresh_token,
            expiresAt
         });
      }
   }

   newHeaders.set('x-shop-customer-token', customerToken || '');
   return NextResponse.next({ request: { headers: newHeaders } });
}

/**
 * Determines the origin from the request.
 */
export function getOrigin(request: NextRequest) {
   const nextOrigin = request.nextUrl.origin;
   return nextOrigin === 'https://localhost:3000' || nextOrigin === 'http://localhost:3000'
      ? SHOPIFY_ORIGIN
      : nextOrigin;
}

/**
 * Authorizes a customer by exchanging tokens and setting cookies.
 */
import { serialize } from 'cookie';

export async function authorizeFn(request: NextRequest, origin: string) {
   const clientId = SHOPIFY_CLIENT_ID;
   const newHeaders = new Headers(request.headers);

   const dataInitialToken = await initialAccessToken(
      request,
      origin,
      SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
      clientId
   );
   if (!dataInitialToken.success) {
      console.error('Error: Access Denied. Check logs', dataInitialToken.message);
      newHeaders.set('x-shop-access', 'denied');
      const response = NextResponse.next({ request: { headers: newHeaders } });
      response.cookies.set('shop_access', 'denied', {
         httpOnly: true,
         sameSite: 'lax',
         secure: true,
         path: '/',
         maxAge: 7200
      });
      return response;
   }
   const { access_token, expires_in, id_token, refresh_token } = dataInitialToken.data;

   const customerAccessToken = await exchangeAccessToken(
      access_token,
      clientId,
      SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
      origin || ''
   );
   if (!customerAccessToken.success) {
      console.error('Error: Customer Access Token');
      newHeaders.set('x-shop-access', 'denied');
      const response = NextResponse.next({ request: { headers: newHeaders } });
      response.cookies.set('shop_access', 'denied', {
         httpOnly: true,
         sameSite: 'lax',
         secure: true,
         path: '/',
         maxAge: 7200
      });
      return response;
   }

   newHeaders.set('x-shop-access', 'allowed');
   const accountUrl = new URL(`${origin}/account`);
   // Instead of NextResponse.redirect, create a new response manually:
   const authResponse = new NextResponse(null, {
      status: 302,
      headers: {
         Location: accountUrl.toString()
      }
   });

   // Use the NextResponse cookie API...
   authResponse.cookies.set('shop_access', 'allowed', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 7200
   });

   const expiresAt = new Date(Date.now() + (expires_in! - 120) * 1000).getTime() + '';

   const finalResponse = await createAllCookies({
      response: authResponse,
      customerAccessToken: customerAccessToken.data.access_token,
      expires_in,
      refresh_token,
      expiresAt,
      id_token
   });
   // Re-set shop_access cookie via API
   finalResponse.cookies.set('shop_access', 'allowed', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 7200
   });

   // Manually append a Set-Cookie header:
   const cookieHeader = serialize('shop_access', 'allowed', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 7200
   });
   finalResponse.headers.append('Set-Cookie', cookieHeader);

   // Log headers for debugging
   console.log('Final response headers:', [...finalResponse.headers.entries()]);

   return finalResponse;
}

/**
 * Logs out a customer by redirecting to Shopify's logout endpoint and clearing cookies.
 */
export async function logoutFn(request: NextRequest, origin: string) {
   const idTokenValue = request.cookies.get('shop_id_token')?.value;

   if (!idTokenValue) {
      const logoutUrl = new URL(`${origin}/login`);
      const response = NextResponse.redirect(`${logoutUrl}`);
      return removeAllCookies(response);
   }

   const logoutUrl = new URL(
      `${customerAccountApiUrl}/auth/logout?id_token_hint=${idTokenValue}&post_logout_redirect_uri=${origin}`
   );
   const logoutResponse = NextResponse.redirect(logoutUrl);
   return removeAllCookies(logoutResponse);
}
