import Script from 'next/script';

export default function JudgeMeIntegration() {
   return (
      <>
         <Script id="judge-me-config" strategy="afterInteractive">
            {`
          window.jdgm = window.jdgm || {};
          jdgm.SHOP_DOMAIN = 'dear-john-denim-headquarters.myshopify.com';
          jdgm.PLATFORM = 'shopify';
          jdgm.PUBLIC_TOKEN = '4bhqSL9lbxv604n2xX8QgdGFxQQ';
        `}
         </Script>
         <Script
            src="https://cdn.judge.me/widget_preloader.js"
            strategy="afterInteractive"
            data-cfasync="false"
         />
      </>
   );
}
