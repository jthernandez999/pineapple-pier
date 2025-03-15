import FooterMenu from 'components/layout/footer-menu';
import LogoSquare from 'components/logo-square';
// import PaymentIcons from 'components/PaymentIcons';
import { getMenu } from 'lib/shopify';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

const { COMPANY_NAME, SITE_NAME } = process.env;

interface SocialMedia {
   name: string;
   url: string;
   icon: string;
}

const socialMediaData: SocialMedia[] = [
   {
      name: 'Instagram',
      url: 'https://www.instagram.com/dearjohndenim/',
      icon: '/assets/instagram.svg'
   },
   {
      name: 'Facebook',
      url: 'https://www.facebook.com/DearJohnDenim/?ref=bookmarks',
      icon: '/assets/facebook.svg'
   },
   {
      name: 'YouTube',
      url: 'https://www.youtube.com/@dearjohndenim6838',
      icon: '/assets/youtube.svg'
   },
   {
      name: 'X',
      url: 'https://twitter.com/dearjohndenim',
      icon: '/assets/xIcon.svg'
   },
   {
      name: 'Pinterest',
      url: 'https://www.pinterest.com/dearjohndenim/',
      icon: '/assets/pinterest.svg'
   },
   {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@dearjohndenim',
      icon: '/assets/tiktok.svg'
   }
];

function SocialIcons() {
   return (
      <div className="flex items-center space-x-4">
         {socialMediaData.map((social) => (
            <Link
               key={social.name}
               href={social.url}
               target="_blank"
               rel="noopener noreferrer"
               className="transition-transform duration-300 hover:scale-105 hover:opacity-90"
            >
               <Image
                  src={social.icon}
                  alt={social.name}
                  unoptimized
                  className="h-5 w-5 object-contain brightness-0 filter"
                  width={20}
                  height={20}
               />
               <span className="sr-only">{social.name}</span>
            </Link>
         ))}
      </div>
   );
}

export default async function Footer() {
   const currentYear = new Date().getFullYear();
   const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
   const skeleton = 'w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';
   const menu = await getMenu('next-js-frontend-footer-menu');
   const copyrightName = COMPANY_NAME || SITE_NAME || '';

   return (
      <footer className="text-sm text-neutral-500 dark:text-neutral-400">
         {/* Top row: Logo, Footer Menu, Social Icons */}
         <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-neutral-200 px-6 py-12 dark:border-neutral-700 md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0">
            {/* Left: Logo */}
            <div className="flex flex-col gap-4 md:w-1/4">
               <Link
                  className="flex items-center gap-2 text-black dark:text-white md:pt-1"
                  href="/"
               >
                  <LogoSquare size="sm" />
                  <span className="uppercase">{SITE_NAME}</span>
               </Link>
            </div>
            {/* Center: Footer Menu in an even grid layout */}
            <div className="md:w-1/2">
               <Suspense
                  fallback={
                     <div className="grid h-[188px] w-[200px] grid-cols-2 gap-2">
                        <div className={skeleton} />
                        <div className={skeleton} />
                        <div className={skeleton} />
                        <div className={skeleton} />
                        <div className={skeleton} />
                        <div className={skeleton} />
                     </div>
                  }
               >
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                     <FooterMenu menu={menu} />
                  </div>
               </Suspense>
            </div>
            {/* Right: Social Icons */}
            <div className="flex items-start justify-center md:w-1/4 md:justify-end">
               <SocialIcons />
            </div>
         </div>
         {/* Bottom row: Copyright and Payment Icons */}
         <div className="border-t border-neutral-200 py-6 dark:border-neutral-700">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between md:px-4 min-[1320px]:px-0">
               <p>
                  &copy; {copyrightDate} {copyrightName}
                  {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights
                  reserved.
               </p>
               {/* <PaymentIcons paymentMethods={enabledPaymentTypes} /> */}
            </div>
         </div>
      </footer>
   );
}
