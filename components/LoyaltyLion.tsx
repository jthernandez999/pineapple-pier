'use client';
import { useEffect } from 'react';

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

export default function LoyaltyLion({ token, customer, auth }: LoyaltyLionProps) {
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

      const config: any = { token }; // Your public site token
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
