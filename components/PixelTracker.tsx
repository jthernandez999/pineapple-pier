// components/PixelTracker.tsx
'use client';
import { register } from '@shopify/web-pixels-extension';
import { useEffect } from 'react';

declare global {
   interface Window {
      my_pixel: {
         configure: (config: { pixelId: string; href: string; origin: string }) => void;
         publish: (
            event: string,
            payload: { href: string; origin: string; cookie: string | null }
         ) => void;
      };
      shopify: any;
   }
}

const PixelTracker: React.FC = () => {
   useEffect(() => {
      if (typeof window !== 'undefined' && window.shopify) {
         register(({ analytics, browser, init, settings }) => {
            if (window.my_pixel) {
               window.my_pixel.configure({
                  pixelId: settings.pixelId,
                  href: init.context.window.location.href,
                  origin: init.context.window.location.origin
               });
            }

            analytics.subscribe('page_viewed', async (event: any) => {
               const cookieValue = await browser.cookie.get('my_pixel_cookie');

               if (window.my_pixel) {
                  window.my_pixel.publish('page_viewed', {
                     href: event.context.window.location.href,
                     origin: event.context.window.location.origin,
                     cookie: cookieValue
                  });
               }
            });
         });
      } else {
         console.warn(
            'Shopify global is not defined. Make sure to include the Shopify web pixel script in your _document.'
         );
      }
   }, []);

   return (
      // Hidden because pixels are shy
      <div className="hidden">{/* Pixel Tracker is active */}</div>
   );
};

export default PixelTracker;
