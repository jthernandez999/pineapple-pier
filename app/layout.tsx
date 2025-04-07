// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AnnouncementBar from 'components/AnnouncementBar';
import ArrowUpCircleIcon from 'components/BackToTopButton';
import { CartProvider } from 'components/cart/cart-context';
import Navbar from 'components/layout/navbar';
import LoyaltyLion, { LoyaltyLionProps } from 'components/LoyaltyLion';
import NavbarScrollHandler from 'components/NavbarScrollHandler';
import PixelTracker from 'components/PixelTracker';
import { ProductGroupsProvider } from 'components/product/ProductGroupsContext';
import { GeistSans } from 'geist/font/sans';
import { getCart } from 'lib/shopify';
import { ensureStartsWith } from 'lib/utils';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { getAuthenticatedUser } from '../lib/shopify/customer';
import './globals.css';
import MetaPixelEvents from './MetaPixelEvents';

const {
   TWITTER_CREATOR,
   TWITTER_SITE,
   SITE_NAME,
   NEXT_PUBLIC_LOYALTY_LION_API,
   NEXT_PUBLIC_SHOPIFY_ORIGIN_URL,
   NEXT_PUBLIC_VERCEL_URL
} = process.env;

// Build base URLs
const baseUrl = NEXT_PUBLIC_VERCEL_URL
   ? `https://${NEXT_PUBLIC_VERCEL_URL}`
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
   // Prepare LoyaltyLion props
   const loyaltyLionProps: LoyaltyLionProps = {
      token: NEXT_PUBLIC_LOYALTY_LION_API || ''
   };

   // Concurrently fetch user + cart ID for performance
   const [user, cartCookie] = await Promise.all([
      getAuthenticatedUser(),
      (await cookies()).get('cartId')
   ]);

   console.log('[LL Debug] user from getAuthenticatedUser():', user);

   // If user is present, fetch date + token from /api/generate-loyaltylion-auth-token
   if (user && user.id && user.email) {
      try {
         const url = `${NEXT_PUBLIC_SHOPIFY_ORIGIN_URL}/api/generate-loyaltylion-auth-token`;
         const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Provide exactly the needed data
            body: JSON.stringify({ customerId: user.id, email: user.email })
         });

         if (res.ok) {
            // Single res.json() call
            const { date, token } = await res.json();
            console.log('[LL Debug] date/token from /generate-loyaltylion-auth-token:', {
               date,
               token
            });

            loyaltyLionProps.customer = { id: user.id, email: user.email };
            loyaltyLionProps.auth = { date, token };
         } else {
            console.error(
               '[LL Debug] Error fetching /generate-loyaltylion-auth-token:',
               res.status,
               res.statusText
            );
         }
      } catch (err) {
         console.error('[LL Debug] Exception calling /generate-loyaltylion-auth-token:', err);
      }
   }

   // Use the cartId to build a cart
   const cartId = cartCookie?.value;
   // Potentially do concurrency with getCart if needed, e.g. in the same Promise.all above
   const cart = getCart(cartId);

   return (
      <html lang="en" className={GeistSans.variable}>
         <head>
            {/* LoyaltyLion SDK script */}
            <Script
               id="loyaltylion-sdk"
               strategy="afterInteractive"
               dangerouslySetInnerHTML={{
                  __html: `
              !(function (t, n) {
                var e = n.loyaltylion || []
                if (!e.isLoyaltyLion) {
                  ;(n.loyaltylion = e),
                    void 0 === n.lion && (n.lion = e),
                    (e.version = 2),
                    (e.isLoyaltyLion = !0)
                  var o = n.URLSearchParams,
                    i = n.sessionStorage,
                    r = 'll_loader_revision',
                    a = new Date().toISOString().replace(/-/g, ''),
                    s =
                      'function' == typeof o
                        ? (function () {
                            try {
                              var t = new o(n.location.search).get(r)
                              return t && i.setItem(r, t), i.getItem(r)
                            } catch (t) {
                              return ''
                            }
                          })()
                        : null
                  c(
                    'https://sdk.loyaltylion.net/static/2/' +
                      a.slice(0, 8) +
                      '/loader' +
                      (s ? '-' + s : '') +
                      '.js',
                  )
                  var l = !1
                  e.init = function (t) {
                    if (l) throw new Error('Cannot call lion.init more than once')
                    l = !0
                    var n = (e._token = t.token)
                    if (!n) throw new Error('Token must be supplied to lion.init')
                    var o = []
                    function i(t, n) {
                      t[n] = function () {
                        o.push([n, Array.prototype.slice.call(arguments, 0)])
                      }
                    }
                    '_push configure bootstrap shutdown on removeListener authenticateCustomer'
                      .split(' ')
                      .forEach(function (t) {
                        i(e, t)
                      }),
                      c(
                        'https://sdk.loyaltylion.net/sdk/start/' +
                          a.slice(0, 11) +
                          '/' +
                          n +
                          '.js',
                      ),
                      (e._initData = t),
                      (e._buffer = o)
                  }
                }
                function c(n) {
                  var e = t.getElementsByTagName('script')[0],
                    o = t.createElement('script')
                  ;(o.src = n), (o.crossOrigin = ''), e.parentNode.insertBefore(o, e)
                }
              })(document, window);
            `
               }}
            />
            <Script
               id="mcjs"
               strategy="afterInteractive"
               dangerouslySetInnerHTML={{
                  __html: `
              !function(c,h,i,m,p){
                m = c.createElement(h),
                p = c.getElementsByTagName(h)[0],
                m.async = 1,
                m.src = i,
                p.parentNode.insertBefore(m, p)
              }(document, "script", "https://chimpstatic.com/mcjs-connected/js/users/221485751e2991d442b1d2019/1aaa21e8b2256fc0e6b38305d.js");
            `
               }}
            />
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
                     <PixelTracker />
                     {children}
                     <Toaster closeButton />
                     {/* This calls loyaltylion.init(...) exactly once */}
                     <LoyaltyLion {...loyaltyLionProps} />
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
