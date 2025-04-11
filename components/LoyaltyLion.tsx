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

export default function LoyaltyLion({
   token,
   customer
}: {
   token: string;
   customer?: { id: string; email: string };
}) {
   const [auth, setAuth] = useState<{ date: string; token: string } | undefined>(undefined);

   useEffect(() => {
      // If a customer is logged in, fetch the auth token from our server.
      if (customer) {
         (async () => {
            // Generate the timestamp that you'll use for token generation.
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
                  // Ideally, date should match currentTimestamp.
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

      const config: any = { token };
      if (customer && auth) {
         config.customer = customer;
         config.auth = auth; // auth.date will be the same as used to generate token
      }
      console.log('[LL Debug] loyaltylion.init config:', config);
      window.loyaltylion.init(config);
      window.loyaltylion._initialized = true;
      console.log('[LL Debug] loyaltylion.init complete');
   }, [token, customer, auth]);

   return null;
}
