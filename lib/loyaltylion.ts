// lib/loyaltylion.ts
export const initLoyaltyLion = (config: LoyaltyLionConfig) => {
   if (typeof window === 'undefined') return;

   if (!window.loyaltylion) {
      window.loyaltylion = [];
      window.loyaltylion.isLoyaltyLion = true;
      window.loyaltylion.version = 2;

      const today = new Date().toISOString().replace(/-/g, '');
      const revision = (() => {
         try {
            const param = new URLSearchParams(window.location.search).get('ll_loader_revision');
            if (param) sessionStorage.setItem('ll_loader_revision', param);
            return sessionStorage.getItem('ll_loader_revision');
         } catch {
            return '';
         }
      })();

      const loaderUrl = `https://sdk.loyaltylion.net/static/2/${today.slice(0, 8)}/loader${revision ? '-' + revision : ''}.js`;
      loadScript(loaderUrl);

      let initialized = false;
      window.loyaltylion.init = function (cfg: any) {
         if (initialized) return;
         initialized = true;

         const methods = [
            '_push',
            'configure',
            'bootstrap',
            'shutdown',
            'on',
            'removeListener',
            'authenticateCustomer'
         ];
         window.loyaltylion._buffer = [];
         methods.forEach((method) => {
            window.loyaltylion[method] = (...args: any[]) => {
               window.loyaltylion._buffer.push([method, args]);
            };
         });

         const sdkUrl = `https://sdk.loyaltylion.net/sdk/start/${today.slice(0, 11)}/${cfg.token}.js`;
         loadScript(sdkUrl);
         window.loyaltylion._initData = cfg;
      };
   }

   window.loyaltylion.init(config);
};

const loadScript = (src: string) => {
   const script = document.createElement('script');
   script.src = src;
   script.crossOrigin = '';
   script.async = true;
   document.head.appendChild(script);
};

declare global {
   interface Window {
      loyaltylion?: any;
   }
}

export interface LoyaltyLionConfig {
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
