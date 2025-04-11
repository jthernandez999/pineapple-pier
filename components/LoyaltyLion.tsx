'use client';
import { useEffect, useState } from 'react';

// The config shape for your convenience
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
   // State for storing auth data if a customer is logged in.
   const [auth, setAuth] = useState<{ date: string; token: string } | undefined>(undefined);

   // If a customer is logged in, fetch the auth token from our server-side API.
   useEffect(() => {
      if (customer) {
         (async () => {
            try {
               const res = await fetch('/api/loyaltylion', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     customerId: customer.id,
                     email: customer.email
                     // Optionally you could pass a pre-generated date, or let the API generate one.
                     // date: new Date().toISOString(),
                  })
               });
               if (res.ok) {
                  const { date, token: authToken } = await res.json();
                  setAuth({ date, token: authToken });
               } else {
                  console.error('[LL Debug] Failed to fetch auth token:', res.statusText);
               }
            } catch (error) {
               console.error('[LL Debug] Exception fetching auth token:', error);
            }
         })();
      }
   }, [customer]);

   // Initialize the LoyaltyLion SDK, once per page load.
   useEffect(() => {
      if (typeof window === 'undefined') return;

      if (!window.loyaltylion) {
         console.warn('[LL Debug] loyaltylion global not found (snippet not loaded yet?)');
         return;
      }
      if (typeof window.loyaltylion.init !== 'function') {
         console.warn('[LL Debug] loyaltylion.init is not a function (still buffering?).');
         return;
      }
      if (window.loyaltylion._initialized) {
         console.log('[LL Debug] Already initialized, skipping re-init.');
         return;
      }

      // Build the initial config with the site token.
      const config: any = { token };

      // If the customer and auth token have been fetched, add the customer info to authenticate.
      if (customer && auth) {
         config.customer = customer;
         config.auth = auth;
      }
      console.log('[LL Debug] loyaltylion.init config:', config);
      window.loyaltylion.init(config);
      window.loyaltylion._initialized = true;
      console.log('[LL Debug] loyaltylion.init complete');
   }, [token, customer, auth]);

   return null;
}
