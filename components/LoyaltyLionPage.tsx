'use client';

import { useEffect } from 'react';

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

export default function LoyaltyLionPage() {
   useEffect(() => {
      if (window.loyaltylion && window.loyaltylion.init) {
         window.loyaltylion.init({ token: process.env.NEXT_PUBLIC_LOYALTY_LION_API });
      }
   }, []);

   return (
      <div className="flex w-full justify-center py-10">
         <h1>Dear John Rewards Program</h1>
         <div data-lion-integrated-page="" className="w-full max-w-6xl px-4" />
      </div>
   );
}
