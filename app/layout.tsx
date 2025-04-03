// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AnnouncementBar from 'components/AnnouncementBar';
import ArrowUpCircleIcon from 'components/BackToTopButton';
import { CartProvider } from 'components/cart/cart-context';
import Navbar from 'components/layout/navbar';
import NavbarScrollHandler from 'components/NavbarScrollHandler';
import { ProductGroupsProvider } from 'components/product/ProductGroupsContext';
// import { WelcomeToast } from 'components/welcome-toast';
// import ScrollingText from 'components/ScrollingText';
import PixelTracker from 'components/PixelTracker';
import { GeistSans } from 'geist/font/sans';
import { getCart } from 'lib/shopify';
import { ensureStartsWith } from 'lib/utils';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import MetaPixelEvents from './MetaPixelEvents';

const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
   ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
   : 'http://localhost:3000';
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined;
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined;

export const metadata = {
   metadataBase: new URL(baseUrl),
   title: {
      default: SITE_NAME!,
      template: `%s | ${SITE_NAME}`
   },
   robots: {
      follow: true,
      index: true
   },
   ...(twitterCreator &&
      twitterSite && {
         twitter: {
            card: 'summary_large_image',
            creator: twitterCreator,
            site: twitterSite
         }
      })
};

export default async function RootLayout({ children }: { children: ReactNode }) {
   const cartId = (await cookies()).get('cartId')?.value;
   const cart = getCart(cartId);

   return (
      <html lang="en" className={GeistSans.variable}>
         <head>
            <Script id="mcjs" strategy="afterInteractive">
               {`
                !function(c,h,i,m,p){
                  m = c.createElement(h),
                  p = c.getElementsByTagName(h)[0],
                  m.async = 1,
                  m.src = i,
                  p.parentNode.insertBefore(m,p)
                }(document,"script","https://chimpstatic.com/mcjs-connected/js/users/221485751e2991d442b1d2019/1aaa21e8b2256fc0e6b38305d.js");
              `}
            </Script>
            <Script
               id="jdgm-inline"
               strategy="afterInteractive"
               dangerouslySetInnerHTML={{
                  __html: `
                     jdgm = window.jdgm || {};
                     jdgm.SHOP_DOMAIN = 'dear-john-denim-headquarters.myshopify.com';
                     jdgm.PLATFORM = 'shopify';
                     jdgm.PUBLIC_TOKEN = '4bhqSL9lbxv604n2xX8QgdGFxQQ';
                  `
               }}
            />
            <Script
               data-cfasync="false"
               type="text/javascript"
               strategy="afterInteractive"
               src="https://cdn.judge.me/widget_preloader.js"
            />
         </head>
         <body className="w-full bg-neutral-100 text-black selection:bg-teal-300 dark:bg-neutral-900">
            <ProductGroupsProvider>
               <AnnouncementBar />
               <CartProvider cartPromise={cart}>
                  <Navbar />
                  <NavbarScrollHandler />
                  <main>
                     <MetaPixelEvents />
                     {/* <ScrollingText /> */}
                     <PixelTracker />
                     {children}
                     <Toaster closeButton />
                     {/* <WelcomeToast /> */}
                  </main>
               </CartProvider>
               <SpeedInsights />
               <Analytics />
               <GoogleAnalytics gaId="G-STZJVRZBTL" />
               <ArrowUpCircleIcon />
            </ProductGroupsProvider>
         </body>
      </html>
   );
}
