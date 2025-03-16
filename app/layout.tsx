// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AnnouncementBar from 'components/AnnouncementBar';
import ArrowUpCircleIcon from 'components/BackToTopButton';
import { CartProvider } from 'components/cart/cart-context';
import JudgeMeIntegration from 'components/judgeme/JudgeMeIntegration';
import Navbar from 'components/layout/navbar';
import NavbarScrollHandler from 'components/NavbarScrollHandler';
import { ProductGroupsProvider } from 'components/product/ProductGroupsContext';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
import { getCart } from 'lib/shopify';
import { ensureStartsWith } from 'lib/utils';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

import './globals.css';

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
         <head />
         <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
            <ProductGroupsProvider>
               <AnnouncementBar />
               <CartProvider cartPromise={cart}>
                  <Navbar />
                  <NavbarScrollHandler />
                  <main>
                     {children}
                     <Toaster closeButton />
                     <WelcomeToast />
                     <JudgeMeIntegration />
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
