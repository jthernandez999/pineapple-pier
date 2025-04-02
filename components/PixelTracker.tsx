// components/PixelTracker.tsx
import { register } from '@shopify/web-pixels-extension';
import { useEffect } from 'react';

// Extend the Window interface for our pixel object
declare global {
   interface Window {
      my_pixel: {
         configure: (config: { pixelId: string; href: string; origin: string }) => void;
         publish: (
            event: string,
            payload: { href: string; origin: string; cookie: string | null }
         ) => void;
      };
   }
}

const PixelTracker: React.FC = () => {
   useEffect(() => {
      // Initialize the Shopify pixel extension
      register(({ analytics, browser, init, settings }) => {
         if (typeof window !== 'undefined' && window.my_pixel) {
            window.my_pixel.configure({
               pixelId: settings.pixelId, // Use settings instead of the non-existent configuration property
               href: init.context.window.location.href,
               origin: init.context.window.location.origin
            });
         }

         analytics.subscribe('page_viewed', async (event: any) => {
            const cookieValue = await browser.cookie.get('my_pixel_cookie');

            if (typeof window !== 'undefined' && window.my_pixel) {
               window.my_pixel.publish('page_viewed', {
                  href: event.context.window.location.href,
                  origin: event.context.window.location.origin,
                  cookie: cookieValue
               });
            }
         });
      });
   }, []);

   return (
      // Hidden div because our pixel is too cool to be seen
      <div className="hidden">{/* Pixel Tracker is active */}</div>
   );
};

export default PixelTracker;
