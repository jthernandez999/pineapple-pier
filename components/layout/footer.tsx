// components/Footer.tsx
import FooterMenu from 'components/layout/footer-menu';
import NewsletterSignUpForm from 'components/NewsletterSignUpForm';
import PaymentIcons from 'components/PaymentIcons';
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
                  className="h-6 w-6 object-contain brightness-0 filter"
                  width={35}
                  height={35}
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
   const menu = await getMenu('next-js-frontend-footer-menu');
   const copyrightName = COMPANY_NAME || SITE_NAME || '';

   return (
      <footer className="mt-6 border-t-[0.5px] border-gray-400 bg-white pt-6 text-black">
         {/* Main Footer Section */}
         <div className="mx-auto flex flex-col gap-12 px-6 py-12 md:flex-row md:justify-between">
            {/* Left Column: Logo + Mobile Newsletter */}
            <div className="flex flex-col items-center md:items-start">
               <Link href="/" className="flex items-center gap-3 pb-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-white text-2xl uppercase shadow-xl transition-transform duration-300 hover:scale-105">
                     DJ
                  </span>
                  {/* <span className="hidden text-2xl font-light md:inline-block">{SITE_NAME}</span> */}
               </Link>
               {/* Mobile newsletter: visible only on mobile */}
               <div className="block md:hidden lg:mt-0">
                  <NewsletterSignUpForm />
               </div>
            </div>

            {/* Center Column: Footer Menu */}
            <div className="flex flex-col items-center md:items-start">
               <Suspense
                  fallback={
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-6 w-full animate-pulse rounded bg-neutral-700" />
                        <div className="h-6 w-full animate-pulse rounded bg-neutral-700" />
                        <div className="h-6 w-full animate-pulse rounded bg-neutral-700" />
                        <div className="h-6 w-full animate-pulse rounded bg-neutral-700" />
                     </div>
                  }
               >
                  <FooterMenu menu={menu} />
               </Suspense>
            </div>

            {/* Right Column: Desktop Newsletter + Social Icons */}
            <div className="flex flex-col items-center md:items-start">
               {/* Desktop newsletter: visible only on desktop */}
               <div className="mb-6 hidden md:block md:items-start">
                  <NewsletterSignUpForm />
               </div>
               <SocialIcons />
            </div>
         </div>

         {/* Bottom Section: Copyright */}
         <div className="mx-auto flex flex-col items-center justify-center border-b-[0.5px] border-gray-400 py-6">
            <div className="flex items-center space-x-4">
               <PaymentIcons name={''} icon={''} />
            </div>

            <div className="mx-auto flex justify-center text-center text-xs font-light tracking-wider">
               <p>
                  &copy; {copyrightDate} {copyrightName}
                  {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights
                  reserved.
               </p>
            </div>
         </div>
      </footer>
   );
}
