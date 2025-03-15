'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function sendPageViewEvent() {
   const analyticsData = {
      eventName: 'PAGE_VIEW' as const, // Ensure this matches an AnalyticsEventName from Hydrogen
      data: {
         page: window.location.pathname
         // add additional data as needed...
      }
   };

   fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsData)
   })
      .then((res) => res.json())
      .then((data) => {
         console.log('Analytics sent:', data);
      })
      .catch((err) => console.error('Error sending analytics:', err));
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();

   useEffect(() => {
      sendPageViewEvent();
   }, [pathname]);

   return <>{children}</>;
}
