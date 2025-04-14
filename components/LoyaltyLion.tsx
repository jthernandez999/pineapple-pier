'use client';
import { useEffect, useState } from 'react';

export interface LoyaltyLionProps {
   token: string;
   customer?: {
      id: string;
      email: string;
   };
   auth?: {
      date: string;
      token: string;
   };
}

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

export default function LoyaltyLion({ token, customer }: LoyaltyLionProps) {
   // State to hold auth data returned from our server API.
   const [auth, setAuth] = useState<{ date: string; token: string } | null>(null);

   // Step 1: Initialize LoyaltyLion for guest (site token only)
   useEffect(() => {
      if (typeof window === 'undefined' || !window.loyaltylion) return;
      if (typeof window.loyaltylion.init !== 'function') {
         console.warn('[LL Debug] loyaltylion.init is not a function (still buffering?).');
         return;
      }
      if (!window.loyaltylion._initialized) {
         // console.log('[LL Debug] Initializing LoyaltyLion for guest.');
         window.loyaltylion.init({ token });
         window.loyaltylion._initialized = true;
         // console.log('[LL Debug] LoyaltyLion init complete for guest.');
      }
   }, [token]);

   // Step 2: If a customer is logged in, fetch the auth token
   useEffect(() => {
      if (customer) {
         (async () => {
            // Generate a timestamp which will be used for token generation.
            const currentTimestamp = new Date().toISOString();
            try {
               const res = await fetch('/api/generate-loyaltylion-auth-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     customerId: customer.id,
                     email: customer.email,
                     date: currentTimestamp
                  })
               });
               if (res.ok) {
                  const { date, token: authToken } = await res.json();
                  // Expect the returned date to match currentTimestamp.
                  // console.log('[LL Debug] Fetched auth token with date:', date);
                  setAuth({ date, token: authToken });
               } else {
                  console.error(
                     '[LL Debug] Error fetching auth token:',
                     res.status,
                     res.statusText
                  );
               }
            } catch (error) {
               console.error('[LL Debug] Exception fetching auth token:', error);
            }
         })();
      }
   }, [customer]);

   // Step 3: Authenticate the customer once we have both customer and auth data.
   useEffect(() => {
      if (!customer || !auth) return;
      if (typeof window === 'undefined' || !window.loyaltylion) return;
      if (typeof window.loyaltylion.authenticateCustomer !== 'function') {
         console.warn('[LL Debug] loyaltylion.authenticateCustomer not available.');
         return;
      }
      console.log('[LL Debug] Authenticating customer with LoyaltyLion:', { customer, auth });
      window.loyaltylion.authenticateCustomer({
         customer,
         auth
      });
      // console.log('[LL Debug] LoyaltyLion customer authenticated.');
   }, [customer, auth]);

   return null;
}
