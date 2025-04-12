'use client';
import { useEffect, useRef, useState } from 'react';

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
   const initCalled = useRef(false);

   // Fetch auth token if a customer is provided.
   useEffect(() => {
      if (!customer) return;

      const fetchAuth = async () => {
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
               setAuth({ date, token: authToken });
            } else {
               console.error('[LL Debug] Error fetching auth token:', res.status, res.statusText);
            }
         } catch (error) {
            console.error('[LL Debug] Exception fetching auth token:', error);
         }
      };

      fetchAuth();
   }, [customer]);

   // Initialize LoyaltyLion SDK once with the site token.
   useEffect(() => {
      if (typeof window === 'undefined') return;
      if (initCalled.current) {
         console.log('[LL Debug] LoyaltyLion already initialized, skipping init.');
         return;
      }
      if (!window.loyaltylion) {
         console.warn('[LL Debug] loyaltylion global not found (snippet not loaded yet?)');
         return;
      }
      if (typeof window.loyaltylion.init !== 'function') {
         console.warn('[LL Debug] loyaltylion.init is not a function (still buffering?).');
         return;
      }
      if (window.loyaltylion._initialized) {
         console.log('[LL Debug] Already initialized via window flag, skipping init.');
         initCalled.current = true;
         return;
      }

      const config = { token };
      console.log('[LL Debug] Calling loyaltylion.init with config:', config);
      window.loyaltylion.init(config);
      window.loyaltylion._initialized = true;
      initCalled.current = true;
      console.log('[LL Debug] loyaltylion.init complete');
   }, [token]);

   // Authenticate the customer after initial init, if customer and auth are available.
   useEffect(() => {
      if (typeof window === 'undefined') return;
      if (!customer || !auth) return;
      if (typeof window.loyaltylion.authenticateCustomer !== 'function') {
         console.warn('[LL Debug] loyaltylion.authenticateCustomer is not a function.');
         return;
      }
      console.log('[LL Debug] Authenticating customer with config:', { customer, auth });
      window.loyaltylion.authenticateCustomer({
         customer,
         auth
      });
   }, [customer, auth]);

   return null;
}
