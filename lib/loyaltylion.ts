// lib/loyaltylion.ts
'use client';
export function loadLoyaltyLionSnippet() {
   if (typeof window === 'undefined') return;
   if (window.loyaltylion) return; // Already loaded

   // This mirrors the snippet from LoyaltyLion docs
   (function (d, w) {
      const e = w.loyaltylion || [];
      if (!e.isLoyaltyLion) {
         w.loyaltylion = e;
         w.lion = e;
         e.version = 2;
         e.isLoyaltyLion = true;

         const today = new Date().toISOString().replace(/-/g, '');
         const loaderUrl = `https://sdk.loyaltylion.net/static/2/${today.slice(0, 8)}/loader.js`;
         loadScript(loaderUrl);

         let initialized = false;
         e.init = function (cfg: any) {
            if (initialized) return;
            initialized = true;

            // Buffer calls until the real SDK arrives
            const methods = [
               '_push',
               'configure',
               'bootstrap',
               'shutdown',
               'on',
               'removeListener',
               'authenticateCustomer'
            ];
            e._buffer = [];
            methods.forEach((method) => {
               e[method] = (...args: any[]) => e._buffer.push([method, args]);
            });

            // Load the actual "start" script
            const sdkUrl = `https://sdk.loyaltylion.net/sdk/start/${today.slice(0, 11)}/${cfg.token}.js`;
            loadScript(sdkUrl);
            e._initData = cfg;
         };
      }

      function loadScript(src: string) {
         const s = d.createElement('script');
         s.src = src;
         s.async = true;
         s.crossOrigin = '';
         d.head.appendChild(s);
      }
   })(document, window);
}
