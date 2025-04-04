'use client';

import { useEffect } from 'react';
const token = process.env.NEXT_PUBLIC_LOYALTY_LION_API;

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

interface LoyaltyLionProps {
   token: string;
   customer?: { id: string; email: string };
   auth?: { date: string; token: string };
}

export default function LoyaltyLion({ token, customer, auth }: LoyaltyLionProps) {
   useEffect(() => {
      console.log('[LoyaltyLion] useEffect triggered');

      // Check if the SDK is loaded
      if (!window.loyaltylion) {
         console.log('[LoyaltyLion] window.loyaltylion is undefined. SDK not loaded yet.');
         return;
      }

      if (typeof window.loyaltylion.init !== 'function') {
         console.log('[LoyaltyLion] loyaltylion.init is not a function.');
         return;
      }

      // Avoid multiple inits in the same page load
      if (window.loyaltylion._initialized) {
         console.log('[LoyaltyLion] Already initialized. Skipping.');
         return;
      }

      // Build config
      const config: any = { token };
      if (customer && auth) {
         config.customer = customer;
         config.auth = auth;
      }

      console.log('[LoyaltyLion] Initializing with config');
      window.loyaltylion.init(config);
      window.loyaltylion._initialized = true;
      console.log('[LoyaltyLion] Initialization complete.');
   }, [token, customer, auth]);

   return null;
}
