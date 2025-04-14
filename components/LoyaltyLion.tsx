'use client';
import { useEffect, useState } from 'react';

export interface LoyaltyLionProps {
   token: string;
   customer?: {
      id: string;
      email: string;
   };
}

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

export default function LoyaltyLion({ token, customer }: LoyaltyLionProps) {
   // State to hold auth data once it is fetched.
   const [auth, setAuth] = useState<{ date: string; token: string } | undefined>(undefined);

   // Fetch the auth token if a customer is logged in.
   useEffect(() => {
      if (customer) {
         (async () => {
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
                  // We expect the returned "date" to match the one we sent.
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

   // Initial SDK initialization effect.
   useEffect(() => {
      if (typeof window === 'undefined' || !window.loyaltylion) return;
      if (typeof window.loyaltylion.init !== 'function') {
         console.warn('[LL Debug] loyaltylion.init is not a function (still buffering?).');
         return;
      }
      // If there is no customer or no auth data yet, initialize as a guest.
      if (!customer || !auth) {
         if (!window.loyaltylion._initialized) {
            console.log('[LL Debug] Initializing LoyaltyLion for guest.');
            window.loyaltylion.init({ token });
            window.loyaltylion._initialized = true;
            console.log('[LL Debug] LoyaltyLion init complete for guest.');
         }
      }
   }, [token, customer, auth]);

   // Effect to authenticate the customer once auth data is available.
   useEffect(() => {
      if (!customer || !auth) return;
      if (typeof window === 'undefined' || !window.loyaltylion) return;
      if (typeof window.loyaltylion.authenticateCustomer !== 'function') {
         console.warn('[LL Debug] loyaltylion.authenticateCustomer not available.');
         return;
      }
      console.log('[LL Debug] Authenticating customer with LoyaltyLion:', { customer, auth });
      // Call authenticateCustomer to update the logged-in status.
      window.loyaltylion.authenticateCustomer({
         customer,
         auth
      });
      console.log('[LL Debug] LoyaltyLion customer authenticated.');
   }, [customer, auth]);

   return null;
}
