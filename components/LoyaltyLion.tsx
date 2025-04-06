'use client';

import { useEffect } from 'react';
const token = process.env.NEXT_PUBLIC_LOYALTY_LION_API;

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

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

export default function LoyaltyLion({ token, customer, auth }: LoyaltyLionProps) {
   useEffect(() => {
      console.log('[LL Debug] useEffect triggered - loyaltylion object:', window.loyaltylion);

      if (!window.loyaltylion) {
         console.log('[LL Debug] loyaltylion is undefined - SDK not loaded?');
         return;
      }

      if (typeof window.loyaltylion.init !== 'function') {
         console.log('[LL Debug] loyaltylion.init is not a function - snippet not fully loaded?');
         return;
      }

      if (window.loyaltylion._initialized) {
         console.log('[LL Debug] Already initialized. Skipping re-init.');
         return;
      }

      const config: any = { token };
      if (customer && auth) {
         // Debug: confirm that date & token match server response
         console.log('[LL Debug] setting customer & auth:', customer, auth);
         config.customer = customer;
         config.auth = auth;
      } else {
         console.log('[LL Debug] no customer or auth data provided - init with site token only');
      }

      console.log('[LL Debug] calling loyaltylion.init with config:', config);
      window.loyaltylion.init(config);
      window.loyaltylion._initialized = true;
      console.log('[LL Debug] loyaltylion.init complete');
   }, [token, customer, auth]);

   return null;
}
