import { authorizeFn, getOrigin, isLoggedIn, logoutFn } from 'lib/shopify/customer';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract account number from the customer token.
// Adjust the decoding logic as needed for your token structure.
async function getCustomerAccountNumber(request: NextRequest): Promise<string | null> {
   const token = request.cookies.get('shop_customer_token')?.value;
   if (!token) return null;

   try {
      // Split the token and check for a valid JWT structure.
      const parts = token.split('.');
      if (parts.length < 2) return null;
      // Assert that parts[1] is defined.
      const payloadBase64 = parts[1]!;
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      // Adjust 'accountNumber' to match your actual token payload property.
      return payload.accountNumber || null;
   } catch (error) {
      console.error('Failed to extract account number::::', error);
      return null;
   }
}

export async function middleware(request: NextRequest) {
   const url = request.nextUrl.clone();
   // Ensure origin is defined—if getOrigin returns undefined, you'll get a runtime error.
   const origin = getOrigin(request) as string;

   // --- Dynamic Homepage Redirect Logic ---
   if (url.pathname === '/' && !url.searchParams.has('accountNumber')) {
      const accountNumber = await getCustomerAccountNumber(request);
      if (accountNumber) {
         url.searchParams.set('accountNumber', accountNumber);
         console.log(`Redirecting to homepage with account number: ${accountNumber}`);
         return NextResponse.redirect(url);
      }
   }

   // --- Authorize Middleware ---
   if (url.pathname.startsWith('/authorize')) {
      console.log('Running Initial Authorization Middleware');
      return await authorizeFn(request, origin);
   }

   // --- Logout Middleware ---
   if (url.pathname.startsWith('/logout')) {
      console.log('Running Logout middleware');
      return await logoutFn(request, origin);
   }

   // --- Account Middleware ---
   if (url.pathname.startsWith('/account')) {
      console.log('Running Account middleware');
      return await isLoggedIn(request, origin);
   }

   return NextResponse.next();
}

export const config = {
   matcher: ['/', '/authorize', '/logout', '/account']
};
