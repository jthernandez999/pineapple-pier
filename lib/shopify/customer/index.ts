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
}): Promise<{ status: number; body: T } | never> {
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
         cache: 'no-store', //NEVER CACHE THE CUSTOMER REQUEST!!!
         ...(tags && { next: { tags } })
      });

      const body = await result.json();

      if (!result.ok) {
         //the statuses here could be different, a 401 means
         //https://shopify.dev/docs/api/customer#endpoints
         //401 means the token is bad
         // console.log('Error in Customer Fetch Status', body.errors);
         if (result.status === 401) {
            // clear session because current access token is invalid
            const errorMessage = 'unauthorized';
            throw errorMessage; //this should throw in the catch below in the non-shopify catch
         }
         let errors;
         try {
            errors = parseJSON(body);
         } catch (_e) {
            errors = [{ message: body }];
         }
         throw errors;
      }

      //this just throws an error and the error boundary is called
      if (body.errors) {
         //throw 'Error'
         // console.log('Error in Customer Fetch', body.errors[0]);
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

      throw {
         error: e,
         query
      };
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

// export async function authorizeFn(request: NextRequest, origin: string) {
//    const clientId = SHOPIFY_CLIENT_ID;
//    const newHeaders = new Headers(request.headers);
//    /***
//   STEP 1: Get the initial access token or deny access
//   ****/
//    const dataInitialToken = await initialAccessToken(
//       request,
//       origin,
//       customerAccountApiUrl,
//       clientId
//    );
//    if (!dataInitialToken.success) {
//       console.log('Error: Access Denied. Check logs', dataInitialToken.message);
//       newHeaders.set('x-shop-access', 'denied');
//       return NextResponse.next({
//          request: {
//             // New request headers
//             headers: newHeaders
//          }
//       });
//    }
//    const { access_token, expires_in, id_token, refresh_token } = dataInitialToken.data;
//    /***
//   STEP 2: Get a Customer Access Token
//   ****/
//    const customerAccessToken = await exchangeAccessToken(
//       access_token,
//       clientId,
//       customerAccountApiUrl,
//       origin || ''
//    );
//    if (!customerAccessToken.success) {
//       console.log('Error: Customer Access Token');
//       newHeaders.set('x-shop-access', 'denied');
//       return NextResponse.next({
//          request: {
//             // New request headers
//             headers: newHeaders
//          }
//       });
//    }
//    //console.log("customer access Token", customerAccessToken.data.access_token)
//    /**STEP 3: Set Customer Access Token cookies
//   We are setting the cookies here b/c if we set it on the request, and then redirect
//   it doesn't see to set sometimes
//   **/
//    newHeaders.set('x-shop-access', 'allowed');
//    /*
//   const authResponse = NextResponse.next({
//     request: {
//       // New request headers
//       headers: newHeaders,
//     },
//   })
//   */
//    const accountUrl = new URL(`${origin}/account`);
//    const authResponse = NextResponse.redirect(`${accountUrl}`);

//    //sets an expires time 2 minutes before expiration which we can use in refresh strategy
//    //const test_expires_in = 180 //to test to see if it expires in 60 seconds!
//    const expiresAt = new Date(new Date().getTime() + (expires_in! - 120) * 1000).getTime() + '';

//    return await createAllCookies({
//       response: authResponse,
//       customerAccessToken: customerAccessToken?.data?.access_token,
//       expires_in,
//       refresh_token,
//       expiresAt,
//       id_token
//    });
// }

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

// export async function logoutFn(request: NextRequest, origin: string) {
//    //console.log("New Origin", newOrigin)
//    const idToken = request.cookies.get('shop_id_token');
//    const idTokenValue = idToken?.value;
//    //revalidateTag(TAGS.customer); //this causes some strange error in Nextjs about invariant, so removing for now.

//    //if there is no idToken, then sending to logout url will redirect shopify, so just
//    //redirect to login here and delete cookies (presumably they don't even exist)
//    if (!idTokenValue) {
//       const logoutUrl = new URL(`${origin}/login`);
//       const response = NextResponse.redirect(`${logoutUrl}`);
//       return removeAllCookies(response);
//    }

//    //console.log ("id toke value", idTokenValue)
//    const logoutUrl = new URL(
//       `${customerAccountApiUrl}/logout?id_token_hint=${idTokenValue}&post_logout_redirect_uri=${origin}`
//    );
//    //console.log ("logout url", logoutUrl)
//    const logoutResponse = NextResponse.redirect(logoutUrl);
//    return removeAllCookies(logoutResponse);
// }

// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';
// //import { revalidateTag } from 'next/cache';
// import { parseJSON } from 'lib/shopify/customer/utils/parse-json';
// import { isShopifyError } from 'lib/type-guards';
// import {
//    checkExpires,
//    createAllCookies,
//    exchangeAccessToken,
//    initialAccessToken,
//    removeAllCookies
// } from './auth-helpers';
// import {
//    SHOPIFY_CLIENT_ID,
//    SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
//    SHOPIFY_CUSTOMER_API_VERSION,
//    SHOPIFY_ORIGIN,
//    SHOPIFY_USER_AGENT
// } from './constants';

// type ExtractVariables<T> = T extends { variables: object } ? T['variables'] : never;
// const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
// const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
// const userAgent = SHOPIFY_USER_AGENT;
// const customerEndpoint = `${customerAccountApiUrl}/account/customer/api/${apiVersion}/graphql`;

// //NEVER CACHE THIS! Doesn't see to be cached anyway b/c
// //https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#opting-out-of-data-caching
// //The fetch request comes after the usage of headers or cookies.
// //and we always send this anyway after getting a cookie for the customer
// export async function shopifyCustomerFetch<T>({
//    cache = 'no-store',
//    customerToken,
//    query,
//    tags,
//    variables
// }: {
//    cache?: RequestCache;
//    customerToken: string;
//    query: string;
//    tags?: string[];
//    variables?: ExtractVariables<T>;
// }): Promise<{ status: number; body: T } | never> {
//    try {
//       const customerOrigin = SHOPIFY_ORIGIN;
//       const result = await fetch(customerEndpoint, {
//          method: 'POST',
//          headers: {
//             'Content-Type': 'application/json',
//             'User-Agent': userAgent,
//             Origin: customerOrigin,
//             Authorization: customerToken
//          },
//          body: JSON.stringify({
//             ...(query && { query }),
//             ...(variables && { variables })
//          }),
//          cache: 'no-store', //NEVER CACHE THE CUSTOMER REQUEST!!!
//          ...(tags && { next: { tags } })
//       });

//       const body = await result.json();

//       if (!result.ok) {
//          //the statuses here could be different, a 401 means
//          //https://shopify.dev/docs/api/customer#endpoints
//          //401 means the token is bad
//          console.log('Error in Customer Fetch Status', body.errors);
//          if (result.status === 401) {
//             // clear session because current access token is invalid
//             const errorMessage = 'unauthorized';
//             throw errorMessage; //this should throw in the catch below in the non-shopify catch
//          }
//          let errors;
//          try {
//             errors = parseJSON(body);
//          } catch (_e) {
//             errors = [{ message: body }];
//          }
//          throw errors;
//       }

//       //this just throws an error and the error boundary is called
//       if (body.errors) {
//          //throw 'Error'
//          console.log('Error in Customer Fetch', body.errors[0]);
//          throw body.errors[0];
//       }

//       return {
//          status: result.status,
//          body
//       };
//    } catch (e) {
//       if (isShopifyError(e)) {
//          throw {
//             cause: e.cause?.toString() || 'unknown',
//             status: e.status || 500,
//             message: e.message,
//             query
//          };
//       }

//       throw {
//          error: e,
//          query
//       };
//    }
// }

// export async function isLoggedIn(request: NextRequest, origin: string) {
//    const customerToken = request.cookies.get('shop_customer_token');
//    const customerTokenValue = customerToken?.value;
//    const refreshToken = request.cookies.get('shop_refresh_token');
//    const refreshTokenValue = refreshToken?.value;
//    const newHeaders = new Headers(request.headers);
//    if (!customerTokenValue && !refreshTokenValue) {
//       const redirectUrl = new URL(`${origin}`);
//       const response = NextResponse.redirect(`${redirectUrl}`);
//       return removeAllCookies(response);
//    }

//    const expiresToken = request.cookies.get('shop_expires_at');
//    const expiresTokenValue = expiresToken?.value;
//    if (!expiresTokenValue) {
//       const redirectUrl = new URL(`${origin}`);
//       const response = NextResponse.redirect(`${redirectUrl}`);
//       return removeAllCookies(response);
//       //return { success: false, message: `no_expires_at` }
//    }
//    const isExpired = await checkExpires({
//       request: request,
//       expiresAt: expiresTokenValue,
//       origin: origin
//    });
//    console.log('is Expired?', isExpired);
//    //only execute the code below to reset the cookies if it was expired!
//    if (isExpired.ranRefresh) {
//       const isSuccess = isExpired?.refresh?.success;
//       if (!isSuccess) {
//          const redirectUrl = new URL(`${origin}`);
//          const response = NextResponse.redirect(`${redirectUrl}`);
//          return removeAllCookies(response);
//          //return { success: false, message: `no_refresh_token` }
//       } else {
//          const refreshData = isExpired?.refresh?.data;
//          //console.log ("refresh data", refreshData)
//          console.log('We used the refresh token, so now going to reset the token and cookies');
//          const newCustomerAccessToken = refreshData?.customerAccessToken;
//          const expires_in = refreshData?.expires_in;
//          //const test_expires_in = 180 //to test to see if it expires in 60 seconds!
//          const expiresAt =
//             new Date(new Date().getTime() + (expires_in! - 120) * 1000).getTime() + '';
//          newHeaders.set('x-shop-customer-token', `${newCustomerAccessToken}`);
//          const resetCookieResponse = NextResponse.next({
//             request: {
//                // New request headers
//                headers: newHeaders
//             }
//          });
//          return await createAllCookies({
//             response: resetCookieResponse,
//             customerAccessToken: newCustomerAccessToken,
//             expires_in,
//             refresh_token: refreshData?.refresh_token,
//             expiresAt
//          });
//       }
//    }

//    newHeaders.set('x-shop-customer-token', `${customerTokenValue}`);
//    return NextResponse.next({
//       request: {
//          // New request headers
//          headers: newHeaders
//       }
//    });
// }

// //when we are running on the production website we just get the origin from the request.nextUrl
// export function getOrigin(request: NextRequest) {
//    const nextOrigin = request.nextUrl.origin;
//    //console.log("Current Origin", nextOrigin)
//    //when running localhost, we want to use fake origin otherwise we use the real origin
//    let newOrigin = nextOrigin;
//    if (nextOrigin === 'https://localhost:3000' || nextOrigin === 'http://localhost:3000') {
//       newOrigin = SHOPIFY_ORIGIN;
//    } else {
//       newOrigin = nextOrigin;
//    }
//    return newOrigin;
// }

// export async function authorizeFn(request: NextRequest, origin: string) {
//    const clientId = SHOPIFY_CLIENT_ID;
//    const newHeaders = new Headers(request.headers);
//    /***
//   STEP 1: Get the initial access token or deny access
//   ****/
//    const dataInitialToken = await initialAccessToken(
//       request,
//       origin,
//       customerAccountApiUrl
//       // clientId
//    );
//    if (!dataInitialToken.success) {
//       console.log('Error: Access Denied. Check logs', dataInitialToken.message);
//       newHeaders.set('x-shop-access', 'denied');
//       return NextResponse.next({
//          request: {
//             // New request headers
//             headers: newHeaders
//          }
//       });
//    }
//    const { access_token, expires_in, id_token, refresh_token } = dataInitialToken.data;
//    /***
//   STEP 2: Get a Customer Access Token
//   ****/
//    const customerAccessToken = await exchangeAccessToken(
//       access_token,
//       clientId,
//       customerAccountApiUrl,
//       origin || ''
//    );
//    if (!customerAccessToken.success) {
//       console.log('Error: Customer Access Token');
//       newHeaders.set('x-shop-access', 'denied');
//       return NextResponse.next({
//          request: {
//             // New request headers
//             headers: newHeaders
//          }
//       });
//    }
//    //console.log("customer access Token", customerAccessToken.data.access_token)
//    /**STEP 3: Set Customer Access Token cookies
//   We are setting the cookies here b/c if we set it on the request, and then redirect
//   it doesn't see to set sometimes
//   **/
//    newHeaders.set('x-shop-access', 'allowed');
//    /*
//   const authResponse = NextResponse.next({
//     request: {
//       // New request headers
//       headers: newHeaders,
//     },
//   })
//   */
//    const accountUrl = new URL(`${origin}/account`);
//    const authResponse = NextResponse.redirect(`${accountUrl}`);

//    //sets an expires time 2 minutes before expiration which we can use in refresh strategy
//    //const test_expires_in = 180 //to test to see if it expires in 60 seconds!
//    const expiresAt = new Date(new Date().getTime() + (expires_in! - 120) * 1000).getTime() + '';

//    return await createAllCookies({
//       response: authResponse,
//       customerAccessToken: customerAccessToken?.data?.access_token,
//       expires_in,
//       refresh_token,
//       expiresAt,
//       id_token
//    });
// }

// export async function logoutFn(request: NextRequest, origin: string) {
//    //console.log("New Origin", newOrigin)
//    const idToken = request.cookies.get('shop_id_token');
//    const idTokenValue = idToken?.value;
//    //revalidateTag(TAGS.customer); //this causes some strange error in Nextjs about invariant, so removing for now

//    //if there is no idToken, then sending to logout url will redirect shopify, so just
//    //redirect to login here and delete cookies (presumably they don't even exist)
//    if (!idTokenValue) {
//       const logoutUrl = new URL(`${origin}/login`);
//       const response = NextResponse.redirect(`${logoutUrl}`);
//       return removeAllCookies(response);
//    }

//    //console.log ("id toke value", idTokenValue)
//    const logoutUrl = new URL(
//       `${customerAccountApiUrl}/auth/logout?id_token_hint=${idTokenValue}&post_logout_redirect_uri=${origin}`
//    );
//    //console.log ("logout url", logoutUrl)
//    const logoutResponse = NextResponse.redirect(logoutUrl);
//    return removeAllCookies(logoutResponse);
// }
