'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function WelcomeToast() {
   useEffect(() => {
      // ignore if screen height is too small
      if (window.innerHeight < 650) return;
      if (!document.cookie.includes('welcome-toast=2')) {
         toast('🛍️ Welcome to Next.js Commerce!', {
            id: 'welcome-toast',
            duration: Infinity,
            onDismiss: () => {
               document.cookie = 'welcome-toast=2; max-age=31536000; path=/';
            },
            description: (
               <>
                  {/* welcome to dear john denim we are updating our site to make it better for you. we will be back soon. thank you for your patience.*/}
                  <p className="text-sm">
                     Welcome to Dear John Denim! We are updating our site to make it better for you.
                     We will be back soon. Thank you for your patience.
                  </p>
               </>
            )
         });
      }
   }, []);

   return null;
}
