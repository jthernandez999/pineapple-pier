import { authorizeFn, getOrigin, isLoggedIn, logoutFn } from 'lib/shopify/customer';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract account number from the customer token.
async function getCustomerAccountNumber(request: NextRequest): Promise<string | null> {
   const token = request.cookies.get('shop_customer_token')?.value;
   console.log('DEBUG: shop_customer_token:', token);

   if (!token) return null;

   try {
      const parts = token.split('.');
      if (parts.length < 2) {
         console.log('DEBUG: Token split doesn’t have enough parts:', parts);
         return null;
      }
      const payloadBase64 = parts[1]!;
      // Use Buffer (Edge runtime) to decode the base64 payload
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      console.log('DEBUG: Decoded payload JSON:', payloadJson);
      const payload = JSON.parse(payloadJson);
      console.log('DEBUG: Parsed payload:', payload);

      // Return payload.accountNumber if exists, fallback to payload.sub.
      return payload.accountNumber || payload.sub || null;
   } catch (error) {
      console.error('DEBUG: Failed to extract account number:', error);
      return null;
   }
}

export async function middleware(request: NextRequest) {
   const url = request.nextUrl.clone();

   // --- Return Label Redirect Logic ---
   if (
      (url.hostname === 'dearjohndenim.com' || url.hostname === 'www.dearjohndenim.com') &&
      url.pathname.includes('/return_labels/')
   ) {
      console.log('DEBUG: Return label URL detected, redirecting to dearjohndenim.co');
      url.hostname = 'www.dearjohndenim.co';
      return NextResponse.redirect(url);
   }

   const origin = getOrigin(request) as string;
   console.log('DEBUG: URL pathname:', url.pathname);
   console.log('DEBUG: Origin:', origin);

   // --- Homepage Redirect Logic (exactly '/') ---
   if (url.pathname === '/') {
      // Only redirect if no accountNumber param is present
      if (!url.searchParams.has('accountNumber')) {
         const accountNumber = await getCustomerAccountNumber(request);
         if (accountNumber) {
            url.searchParams.set('accountNumber', accountNumber);
            console.log(`DEBUG: Redirecting to homepage with account number: ${accountNumber}`);
            return NextResponse.redirect(url);
         } else {
            console.log('DEBUG: No account number found; not redirecting homepage');
         }
      }
   }

   // --- Authorize Middleware ---
   if (url.pathname.startsWith('/authorize')) {
      console.log('DEBUG: Running Initial Authorization Middleware');
      const authResponse = await authorizeFn(request, origin);
      console.log('DEBUG: authorizeFn response:', authResponse);
      return authResponse;
   }

   // --- Logout Middleware ---
   if (url.pathname.startsWith('/logout')) {
      console.log('DEBUG: Running Logout Middleware');
      const logoutResponse = await logoutFn(request, origin);
      console.log('DEBUG: logoutFn response:', logoutResponse);
      return logoutResponse;
   }

   // --- Account Middleware ---
   if (url.pathname.startsWith('/account')) {
      console.log('DEBUG: Running Account Middleware');
      const loggedInResponse = await isLoggedIn(request, origin);
      console.log('DEBUG: isLoggedIn response:', loggedInResponse);

      // If isLoggedIn recognized the user, it might set special headers
      // e.g., 'x-shop-customer-id', 'x-shop-customer-email'
      const userId = loggedInResponse.headers.get('x-shop-customer-id');
      const userEmail = loggedInResponse.headers.get('x-shop-customer-email');

      if (userId && userEmail) {
         console.log('DEBUG: Setting user data cookies for loyalty usage:', userId, userEmail);

         // We wrap the returned response so we can set two cookies:
         // id, email
         // (Your layout can read these to build the LoyaltyLion auth.)
         const newResponse = NextResponse.next({
            request: { headers: loggedInResponse.headers }
         });
         newResponse.cookies.set('id', userId, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax'
         });
         newResponse.cookies.set('email', userEmail, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax'
         });

         return newResponse;
      }

      // If no user, just return the original response
      return loggedInResponse;
   }
   logCustomerEmail(request)
      .then(() => console.log('Customer email logged successfully'))
      .catch((error) => console.error('Error logging customer email:', error));

   console.log('DEBUG: No matching route; proceeding normally.');
   return NextResponse.next();
}

export const config = {
   matcher: ['/', '/authorize', '/logout', '/account/:path*']
};

import { getAuthenticatedUser } from 'lib/shopify/customer';

export async function logCustomerEmail(request: NextRequest) {
   const user = await getAuthenticatedUser();
   if (user && user.email) {
      console.log('Customer email:', user.email);
   } else {
      console.log('No customer email available');
   }
}
// Call the function to log the customer email
