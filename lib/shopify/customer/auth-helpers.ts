//you need to remain this as type so as not to confuse with the actual function
import { getNonce } from 'lib/shopify/customer/auth-utils';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse as NextResponseType } from 'next/server';
import { SHOPIFY_CLIENT_ID, SHOPIFY_CUSTOMER_ACCOUNT_API_URL } from './constants';

export async function initialAccessToken(
   request: NextRequest,
   newOrigin: string,
   customerAccountApiUrl: string,
   clientId: string
) {
   const code = request.nextUrl.searchParams.get('code');
   const state = request.nextUrl.searchParams.get('state');

   if (!code) {
      console.log('Error: No Code Auth');
      return { success: false, message: `No Code` };
   }
   if (!state) {
      console.log('Error: No State Auth');
      return { success: false, message: `No State` };
   }

   const shopStateValue = request.cookies.get('shop_state')?.value;
   if (!shopStateValue) {
      console.log('Error: No Shop State Value');
      return { success: false, message: `No Shop State` };
   }
   if (state !== shopStateValue) {
      console.log('Error: Shop state mismatch');
      return { success: false, message: `No Shop State Mismatch` };
   }

   const codeVerifierValue = request.cookies.get('shop_verifier')?.value;
   if (!codeVerifierValue) {
      console.log('No Code Verifier');
      return { success: false, message: `No Code Verifier` };
   }

   const body = new URLSearchParams();
   body.append('grant_type', 'authorization_code');
   body.append('client_id', clientId);
   body.append('redirect_uri', `${newOrigin}/authorize`);
   body.append('code', code);
   body.append('code_verifier', codeVerifierValue);

   const userAgent = '*';
   const headersNew = new Headers();
   headersNew.append('Content-Type', 'application/x-www-form-urlencoded');
   headersNew.append('User-Agent', userAgent);
   headersNew.append('Origin', newOrigin || '');

   const tokenRequestUrl = `${customerAccountApiUrl}/oauth/token`;
   const response = await fetch(tokenRequestUrl, {
      method: 'POST',
      headers: headersNew,
      body
   });
   const data = await response.json();
   console.log('data initial access token', data);
   if (!response.ok) {
      console.log('data response error auth', data.error);
      console.log('response auth', response.status);
      return { success: false, message: `Response error auth` };
   }
   if (data?.errors) {
      const errorMessage = data?.errors?.[0]?.message ?? 'Unknown error auth';
      return { success: false, message: `${errorMessage}` };
   }

   const nonce = await getNonce(data?.id_token || '');
   const shopNonceValue = request.cookies.get('shop_nonce')?.value;
   console.log('sent nonce', nonce);
   console.log('original nonce', shopNonceValue);
   if (nonce !== shopNonceValue) {
      console.log('Error: Nonce mismatch');
      return { success: false, message: `Error: Nonce mismatch` };
   }
   return { success: true, data };
}

// export async function initialAccessToken(
//    request: NextRequest,
//    newOrigin: string,
//    customerAccountApiUrl: string,
//    clientId: string
// ) {
//    const code = request.nextUrl.searchParams.get('code');
//    const state = request.nextUrl.searchParams.get('state');
//    /*
//   STEP 1: Check for all necessary cookies and other information
//   */
//    if (!code) {
//       console.log('Error: No Code Auth');
//       return { success: false, message: `No Code` };
//    }
//    if (!state) {
//       console.log('Error: No State Auth');
//       return { success: false, message: `No State` };
//    }
//    const shopState = request.cookies.get('shop_state');
//    const shopStateValue = shopState?.value;
//    if (!shopStateValue) {
//       console.log('Error: No Shop State Value');
//       return { success: false, message: `No Shop State` };
//    }
//    if (state !== shopStateValue) {
//       console.log('Error: Shop state mismatch');
//       return { success: false, message: `No Shop State Mismatch` };
//    }
//    const codeVerifier = request.cookies.get('shop_verifier');
//    const codeVerifierValue = codeVerifier?.value;
//    if (!codeVerifierValue) {
//       console.log('No Code Verifier');
//       return { success: false, message: `No Code Verifier` };
//    }
//    /*
//   STEP 2: GET ACCESS TOKEN
//   */
//    const body = new URLSearchParams();
//    body.append('grant_type', 'authorization_code');
//    body.append('client_id', clientId);
//    body.append('redirect_uri', `${newOrigin}/authorize`);
//    body.append('code', code);
//    body.append('code_verifier', codeVerifier?.value);
//    const userAgent = '*';
//    const headersNew = new Headers();
//    headersNew.append('Content-Type', 'application/x-www-form-urlencoded');
//    headersNew.append('User-Agent', userAgent);
//    headersNew.append('Origin', newOrigin || '');
//    const tokenRequestUrl = `${customerAccountApiUrl}/oauth/token`;
//    const response = await fetch(tokenRequestUrl, {
//       method: 'POST',
//       headers: headersNew,
//       body
//    });
//    const data = await response.json();
//    console.log('data initial access token', data);
//    if (!response.ok) {
//       console.log('data response error auth', data.error);
//       console.log('response auth', response.status);
//       return { success: false, message: `Response error auth` };
//    }
//    if (data?.errors) {
//       const errorMessage = data?.errors?.[0]?.message ?? 'Unknown error auth';
//       return { success: false, message: `${errorMessage}` };
//    }
//    const nonce = await getNonce(data?.id_token || '');
//    const shopNonce = request.cookies.get('shop_nonce');
//    const shopNonceValue = shopNonce?.value;
//    console.log('sent nonce', nonce);
//    console.log('original nonce', shopNonceValue);
//    if (nonce !== shopNonceValue) {
//       //make equal === to force error for testing
//       console.log('Error nonce match');
//       return { success: false, message: `Error: Nonce mismatch` };
//    }
//    return { success: true, data };
// }

export async function exchangeAccessToken(
   token: string,
   customerAccountId: string,
   customerAccountApiUrl: string,
   origin: string
) {
   const clientId = customerAccountId;
   // this constant should match the expected audience for the Customer Account API
   const customerApiClientId = SHOPIFY_CLIENT_ID;
   const accessToken = token;
   const body = new URLSearchParams();
   body.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
   body.append('client_id', clientId);
   body.append('audience', customerApiClientId);
   body.append('subject_token', accessToken);
   body.append('subject_token_type', 'urn:ietf:params:oauth:token-type:access_token');
   body.append('scopes', 'https://api.customers.com/auth/customer.graphql');

   const userAgent = '*';

   const headers = new Headers();
   headers.append('Content-Type', 'application/x-www-form-urlencoded');
   headers.append('User-Agent', userAgent);
   headers.append('Origin', origin);

   const response = await fetch(`${customerAccountApiUrl}/oauth/token`, {
      method: 'POST',
      headers,
      body
   });

   const data = await response.json();
   if (data.error) {
      return { success: false, data: data?.error_description };
   }
   return { success: true, data };
}

// export async function exchangeAccessToken(
//    token: string,
//    customerAccountId: string,
//    customerAccountApiUrl: string,
//    origin: string
// ) {
//    const clientId = customerAccountId;
//    //this is a constant - see the docs. https://shopify.dev/docs/api/customer#useaccesstoken-propertydetail-audience
//    const customerApiClientId = '30243aa5-17c1-465a-8493-944bcc4e88aa';
//    const accessToken = token;
//    const body = new URLSearchParams();
//    body.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
//    body.append('client_id', clientId);
//    body.append('audience', customerApiClientId);
//    body.append('subject_token', accessToken);
//    body.append('subject_token_type', 'urn:ietf:params:oauth:token-type:access_token');
//    body.append('scopes', 'https://api.customers.com/auth/customer.graphql');

//    const userAgent = '*';

//    const headers = new Headers();
//    headers.append('Content-Type', 'application/x-www-form-urlencoded');
//    headers.append('User-Agent', userAgent);
//    headers.append('Origin', origin);

//    // Token Endpoint goes here
//    const response = await fetch(`${customerAccountApiUrl}/oauth/token`, {
//       method: 'POST',
//       headers,
//       body
//    });

//    const data = await response.json();
//    if (data.error) {
//       return { success: false, data: data?.error_description };
//    }
//    return { success: true, data };
// }

export async function refreshToken({ request, origin }: { request: NextRequest; origin: string }) {
   // Retrieve the refresh token from cookies.
   const refreshTokenCookie = request.cookies.get('shop_refresh_token');
   const refreshTokenValue = refreshTokenCookie?.value;
   if (!refreshTokenValue) {
      console.log('Error: No Refresh Token');
      return { success: false, message: 'no_refresh_token' };
   }

   const clientId = SHOPIFY_CLIENT_ID;
   // Build the request body per docs.
   const body = new URLSearchParams();
   body.append('grant_type', 'refresh_token');
   body.append('client_id', clientId);
   body.append('refresh_token', refreshTokenValue);

   // For public clients, the Authorization header is not needed.
   // If you're a confidential client, uncomment and update the following:
   // headers['Authorization'] = 'Basic <credentials>';
   const headers = {
      'content-type': 'application/x-www-form-urlencoded'
   };

   const tokenRequestUrl = `${SHOPIFY_CUSTOMER_ACCOUNT_API_URL}/oauth/token`;
   const response = await fetch(tokenRequestUrl, {
      method: 'POST',
      headers,
      body
   });

   if (!response.ok) {
      const text = await response.text();
      console.log('response error in refresh token', text);
      return { success: false, message: 'no_refresh_token' };
   }

   const data = await response.json();
   console.log('data response from refresh', data);
   const { access_token, expires_in, refresh_token } = data;

   // Optionally, if your flow requires converting the access token into a customer access token,
   // call exchangeAccessToken. If not needed, you can simply return the tokens.
   const customerAccessToken = await exchangeAccessToken(
      access_token,
      clientId,
      SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
      origin
   );
   if (!customerAccessToken.success) {
      return { success: false, message: 'no_refresh_token' };
   }

   return {
      success: true,
      data: {
         customerAccessToken: customerAccessToken.data.access_token,
         expires_in,
         refresh_token
      }
   };
}

// export async function refreshToken({ request, origin }: { request: NextRequest; origin: string }) {
//    const newBody = new URLSearchParams();
//    const refreshToken = request.cookies.get('shop_refresh_token');
//    const refreshTokenValue = refreshToken?.value;
//    if (!refreshTokenValue) {
//       console.log('Error: No Refresh Token');
//       return { success: false, message: `no_refresh_token` };
//    }
//    const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
//    const clientId = SHOPIFY_CLIENT_ID;
//    const userAgent = SHOPIFY_USER_AGENT;
//    newBody.append('grant_type', 'refresh_token');
//    newBody.append('refresh_token', refreshTokenValue);
//    newBody.append('client_id', clientId);
//    const headers = {
//       'content-type': 'application/x-www-form-urlencoded',
//       'User-Agent': userAgent,
//       Origin: origin
//    };
//    const tokenRequestUrl = `${customerAccountApiUrl}/oauth/token`;
//    const response = await fetch(tokenRequestUrl, {
//       method: 'POST',
//       headers,
//       body: newBody
//    });

//    if (!response.ok) {
//       const text = await response.text();
//       console.log('response error in refresh token', text);
//       return { success: false, message: `no_refresh_token` };
//    }
//    const data = await response.json();
//    console.log('data response from initial fetch to refresh', data);
//    const { access_token, expires_in, refresh_token } = data;

//    const customerAccessToken = await exchangeAccessToken(
//       access_token,
//       clientId,
//       customerAccountApiUrl,
//       origin
//    );
//    // console.log("Customer Access Token in refresh request", customerAccessToken)
//    if (!customerAccessToken.success) {
//       return { success: false, message: `no_refresh_token` };
//    }

//    //const expiresAt = new Date(new Date().getTime() + (expires_in - 120) * 1000).getTime() + ''
//    //const idToken = id_token

//    return {
//       success: true,
//       data: {
//          customerAccessToken: customerAccessToken.data.access_token,
//          expires_in,
//          refresh_token
//       }
//    };
// }

export async function checkExpires({
   request,
   expiresAt,
   origin
}: {
   request: NextRequest;
   expiresAt: string;
   origin: string;
}) {
   let isExpired = false;
   if (parseInt(expiresAt, 10) - 1000 < new Date().getTime()) {
      isExpired = true;
      console.log('Isexpired is true, we are running refresh token!');
      const refresh = await refreshToken({ request, origin });
      console.log('refresh', refresh);
      //this will return success: true or success: false - depending on result of refresh
      return { ranRefresh: isExpired, refresh };
   }
   console.log('is expired is false - just sending back success', isExpired);
   return { ranRefresh: isExpired, success: true };
}

export function removeAllCookies(response: NextResponseType) {
   //response.cookies.delete('shop_auth_token') //never set. We don't use it anywhere.
   response.cookies.delete('shop_customer_token');
   response.cookies.delete('shop_refresh_token');
   response.cookies.delete('shop_id_token');
   response.cookies.delete('shop_state');
   response.cookies.delete('shop_nonce');
   response.cookies.delete('shop_verifier');
   response.cookies.delete('shop_expires_at');
   return response;
}

export async function removeAllCookiesServerAction() {
   (await cookies()).delete('shop_customer_token');
   (await cookies()).delete('shop_refresh_token');
   (await cookies()).delete('shop_id_token');
   (await cookies()).delete('shop_state');
   (await cookies()).delete('shop_nonce');
   (await cookies()).delete('shop_verifier');
   (await cookies()).delete('shop_expires_at');
   return { success: true };
}

export async function createAllCookies({
   response,
   customerAccessToken,
   expires_in,
   refresh_token,
   expiresAt,
   id_token
}: {
   response: NextResponseType;
   customerAccessToken: string;
   expires_in: number;
   refresh_token: string;
   expiresAt: string;
   id_token?: string;
}) {
   response.cookies.set('shop_customer_token', customerAccessToken, {
      httpOnly: true, //if true can only read the cookie in server
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: expires_in //value from shopify, seems like this is 2 hours
   });

   //you need to set an expiration here, because otherwise its a sessions cookie
   //and will disappear after the user closes the browser and then we can never refresh - same with expires at below
   response.cookies.set('shop_refresh_token', refresh_token, {
      httpOnly: true, //if true can only read the cookie in server
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 604800 //one week
   });

   //you need to set an expiration here, because otherwise its a sessions cookie
   //and will disappear after the user closes the browser and then we can never refresh
   response.cookies.set('shop_expires_at', expiresAt, {
      httpOnly: true, //if true can only read the cookie in server
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 604800 //one week
   });

   //required for logout - this must be the same as the original expires - it;s long lived so they can logout, otherwise it will expire
   //because that's how we got the token, if this is different, it won't work
   //we don't always send in id_token here. For example, on refresh it's not available, it's only sent in on the initial authorization
   if (id_token) {
      response.cookies.set('shop_id_token', id_token, {
         httpOnly: true, //if true can only read the cookie in server
         sameSite: 'lax', //should be lax???
         secure: true,
         path: '/',
         maxAge: 604800 //one week
      });
   }

   return response;
}

// import { getNonce } from 'lib/shopify/customer/auth-utils';
// import { cookies } from 'next/headers';
// import type { NextRequest, NextResponse as NextResponseType } from 'next/server';
// import {
//    SHOPIFY_CLIENT_ID,
//    SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
//    SHOPIFY_USER_AGENT
// } from './constants';

// export async function initialAccessToken(
//    request: NextRequest,
//    newOrigin: string,
//    //    customerAccountApiUrl: string,
//    clientId: string
// ) {
//    // Retrieve code and state from URL
//    const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
//    const code = request.nextUrl.searchParams.get('code');
//    const state = request.nextUrl.searchParams.get('state');

//    if (!code) {
//       console.log('Error: No Code Auth');
//       return { success: false, message: `No Code` };
//    }
//    if (!state) {
//       console.log('Error: No State Auth');
//       return { success: false, message: `No State` };
//    }

//    // Validate state with cookie value
//    const shopStateValue = request.cookies.get('shop_state')?.value;
//    if (!shopStateValue) {
//       console.log('Error: No Shop State Value');
//       return { success: false, message: `No Shop State` };
//    }
//    if (state !== shopStateValue) {
//       console.log('Error: Shop state mismatch');
//       return { success: false, message: `No Shop State Mismatch` };
//    }

//    // Get code verifier from cookies
//    const codeVerifierValue = request.cookies.get('shop_verifier')?.value;
//    if (!codeVerifierValue) {
//       console.log('No Code Verifier');
//       return { success: false, message: `No Code Verifier` };
//    }

//    // Build URLSearchParams for token exchange
//    const body = new URLSearchParams();
//    body.append('grant_type', 'authorization_code');
//    body.append('client_id', clientId);
//    body.append('redirect_uri', `${newOrigin}/authorize`);
//    body.append('code', code);
//    body.append('code_verifier', codeVerifierValue);

//    // For public clients, an Authorization header is not needed.
//    // Uncomment and update the following for confidential clients if required:
//    // headers: { 'Authorization': 'Basic <credentials>', ... }
//    const headersObj = {
//       'content-type': 'application/x-www-form-urlencoded'
//    };

//    const tokenRequestUrl = `${customerAccountApiUrl}/oauth/token`;
//    const response = await fetch(tokenRequestUrl, {
//       method: 'POST',
//       headers: headersObj,
//       body
//    });

//    const data = await response.json();
//    console.log('data initial access token', data);

//    if (!response.ok) {
//       console.log('data response error auth', data.error);
//       console.log('response auth', response.status);
//       return { success: false, message: `Response error auth` };
//    }
//    if (data?.errors) {
//       const errorMessage = data?.errors?.[0]?.message ?? 'Unknown error auth';
//       return { success: false, message: `${errorMessage}` };
//    }

//    // Validate nonce from the id_token against the shop_nonce cookie
//    const nonce = await getNonce(data?.id_token || '');
//    const shopNonceValue = request.cookies.get('shop_nonce')?.value;
//    console.log('sent nonce', nonce);
//    console.log('original nonce', shopNonceValue);
//    if (nonce !== shopNonceValue) {
//       console.log('Error: Nonce mismatch');
//       return { success: false, message: `Error: Nonce mismatch` };
//    }
//    return { success: true, data };
// }

// export async function exchangeAccessToken(
//    token: string,
//    customerAccountId: string,
//    customerAccountApiUrl: string,
//    origin: string
// ) {
//    const customerApiClientId = SHOPIFY_CLIENT_ID;
//    const body = new URLSearchParams();
//    body.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
//    body.append('client_id', customerAccountId);
//    body.append('audience', customerApiClientId);
//    body.append('subject_token', token);
//    body.append('subject_token_type', 'urn:ietf:params:oauth:token-type:access_token');
//    body.append('scopes', 'https://api.customers.com/auth/customer.graphql');

//    const headers = new Headers();
//    headers.append('Content-Type', 'application/x-www-form-urlencoded');
//    headers.append('User-Agent', '*');
//    headers.append('Origin', origin);

//    const response = await fetch(`${customerAccountApiUrl}/oauth/token`, {
//       method: 'POST',
//       headers,
//       body
//    });

//    const data = await response.json();
//    if (data.error) {
//       return { success: false, data: data?.error_description };
//    }
//    return { success: true, data };
// }

// export async function refreshToken({ request, origin }: { request: NextRequest; origin: string }) {
//    const newBody = new URLSearchParams();
//    const refreshTokenValue = request.cookies.get('shop_refresh_token')?.value;
//    if (!refreshTokenValue) {
//       console.log('Error: No Refresh Token');
//       return { success: false, message: `no_refresh_token` };
//    }
//    const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
//    const clientId = SHOPIFY_CLIENT_ID;
//    const userAgent = SHOPIFY_USER_AGENT;
//    newBody.append('grant_type', 'refresh_token');
//    newBody.append('refresh_token', refreshTokenValue);
//    newBody.append('client_id', clientId);
//    const headers = {
//       'content-type': 'application/x-www-form-urlencoded',
//       'User-Agent': userAgent,
//       Origin: origin
//    };
//    const tokenRequestUrl = `${customerAccountApiUrl}/oauth/token`;
//    const response = await fetch(tokenRequestUrl, {
//       method: 'POST',
//       headers,
//       body: newBody
//    });

//    if (!response.ok) {
//       const text = await response.text();
//       console.log('response error in refresh token', text);
//       return { success: false, message: `no_refresh_token` };
//    }
//    const data = await response.json();
//    console.log('data response from refresh', data);
//    const { access_token, expires_in, refresh_token } = data;

//    const customerAccessToken = await exchangeAccessToken(
//       access_token,
//       clientId,
//       customerAccountApiUrl,
//       origin
//    );
//    if (!customerAccessToken.success) {
//       return { success: false, message: `no_refresh_token` };
//    }
//    return {
//       success: true,
//       data: {
//          customerAccessToken: customerAccessToken.data.access_token,
//          expires_in,
//          refresh_token
//       }
//    };
// }

// export async function checkExpires({
//    request,
//    expiresAt,
//    origin
// }: {
//    request: NextRequest;
//    expiresAt: string;
//    origin: string;
// }) {
//    const isExpired = parseInt(expiresAt, 10) - 1000 < Date.now();
//    if (isExpired) {
//       console.log('Token expired, running refresh token');
//       const refresh = await refreshToken({ request, origin });
//       console.log('refresh', refresh);
//       return { ranRefresh: true, refresh };
//    }
//    console.log('Token not expired');
//    return { ranRefresh: false, success: true };
// }

// export function removeAllCookies(response: NextResponseType) {
//    response.cookies.delete('shop_customer_token');
//    response.cookies.delete('shop_refresh_token');
//    response.cookies.delete('shop_id_token');
//    response.cookies.delete('shop_state');
//    response.cookies.delete('shop_nonce');
//    response.cookies.delete('shop_verifier');
//    response.cookies.delete('shop_expires_at');
//    return response;
// }

// export async function removeAllCookiesServerAction() {
//    (await cookies()).delete('shop_customer_token');
//    (await cookies()).delete('shop_refresh_token');
//    (await cookies()).delete('shop_id_token');
//    (await cookies()).delete('shop_state');
//    (await cookies()).delete('shop_nonce');
//    (await cookies()).delete('shop_verifier');
//    (await cookies()).delete('shop_expires_at');
//    return { success: true };
// }

// export async function createAllCookies({
//    response,
//    customerAccessToken,
//    expires_in,
//    refresh_token,
//    expiresAt,
//    id_token
// }: {
//    response: NextResponseType;
//    customerAccessToken: string;
//    expires_in: number;
//    refresh_token: string;
//    expiresAt: string;
//    id_token?: string;
// }) {
//    response.cookies.set('shop_customer_token', customerAccessToken, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: true,
//       path: '/',
//       maxAge: expires_in
//    });
//    response.cookies.set('shop_refresh_token', refresh_token, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: true,
//       path: '/',
//       maxAge: 604800 // one week
//    });
//    response.cookies.set('shop_expires_at', expiresAt, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: true,
//       path: '/',
//       maxAge: 604800
//    });
//    if (id_token) {
//       response.cookies.set('shop_id_token', id_token, {
//          httpOnly: true,
//          sameSite: 'lax',
//          secure: true,
//          path: '/',
//          maxAge: 604800
//       });
//    }
//    return response;
// }
