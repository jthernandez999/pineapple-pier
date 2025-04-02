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
      // Check that we're running in the browser and the Shopify script is loaded
      if (typeof window !== 'undefined' && window.shopify) {
         register(({ analytics, browser, settings }) => {
            // Use the actual browser location to override the default Shopify context
            const { href, origin } = window.location;

            if (window.my_pixel) {
               window.my_pixel.configure({
                  pixelId: settings.pixelId,
                  href,
                  origin
               });
            }

            analytics.subscribe('page_viewed', async (event: any) => {
               const cookieValue = await browser.cookie.get('my_pixel_cookie');

               if (window.my_pixel) {
                  // Publish the event using the actual browser location
                  window.my_pixel.publish('page_viewed', {
                     href,
                     origin,
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
      // This element is hidden because the pixel does all the work behind the scenes
      <div className="hidden">{/* Pixel Tracker is active */}</div>
   );
};

export default PixelTracker;
