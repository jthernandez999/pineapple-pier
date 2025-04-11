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
   // State for storing auth data for logged-in customers.
   const [auth, setAuth] = useState<{ date: string; token: string } | undefined>(undefined);

   // If a customer is logged in, fetch the auth token using our API endpoint.
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
                     // The API will generate the date if not provided.
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

   // Initialize the LoyaltyLion SDK.
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

      // For logged-in customers, wait until auth is ready.
      if (customer && !auth) {
         console.log(
            '[LL Debug] Customer logged in but auth token not available yet, waiting for auth.'
         );
         return;
      }

      // Build the configuration.
      const config: any = { token };
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
