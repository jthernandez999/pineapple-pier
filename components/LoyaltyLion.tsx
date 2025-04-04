'use client';

import { useEffect } from 'react';

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

type LoyaltyLionProps = {
   token: string;
   customer?: {
      id: string;
      email: string;
   };
   auth?: {
      date: string;
      token: string;
   };
};

export default function LoyaltyLion({ token, customer, auth }: LoyaltyLionProps) {
   useEffect(() => {
      if (window.loyaltylion?.init) {
         const config: LoyaltyLionProps = { token };
         if (customer && auth) {
            config.customer = customer;
            config.auth = auth;
         }
         window.loyaltylion.init(config);
      }
   }, [token, customer, auth]);

   return null;
}
