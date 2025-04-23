// components/layout/navbar/index.tsx
import CartModal from 'components/cart/modal';
import ClientDesktopMenu from 'components/navigation/ClientDesktopMenu';
import { getMenu } from 'lib/shopify';
import { Menu } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';
import AnimatedLogo from '../../../components/animated-logo';
import LoginModalTrigger from '../../../components/auth/ProfileAuthModal';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';

interface NavbarProps {
   siteName: string;
}

export default async function Navbar() {
   const menu: Menu[] = await getMenu('main-menu');
   console.log('Navbar menu:', menu);
   return (
      <nav className="bg-white-opacity-0 absolute top-0 z-[66] mt-5 w-full border-gray-200 dark:border-gray-600 dark:bg-gray-900 lg:top-20">
         <div className="mx-auto flex w-full items-center justify-between p-4">
            {/* Left Section */}
            <div className="flex items-center">
               <div id="mobile-menu" className="hidden md:hidden">
                  <MobileMenu menu={menu} />
               </div>
               <LogoArea />
            </div>

            {/* Center Section */}
            {/* <div id="desktop-menu" className="hidden md:block lg:block"> */}

            <div id="desktop-menu" className="hidden md:hidden lg:hidden">
               <ClientDesktopMenu menu={menu} />
            </div>

            {/* Right Section: Search and Cart */}
            <div id="search-cart" className="hidden items-center gap-4">
               <div className="hidden md:block">
                  <Suspense fallback={<SearchSkeleton />}>
                     <Search />
                  </Suspense>
               </div>
               <CartModalArea />
               <Suspense fallback={<p>Login</p>}>
                  {/* <Login /> */}
                  <LoginModalTrigger />
               </Suspense>
            </div>
         </div>
      </nav>
   );
}

function LogoArea() {
   return (
      <div className="flex items-center">
         <Link href="/" className="flex items-center gap-2">
            <AnimatedLogo />
         </Link>
      </div>
   );
}

function CartModalArea() {
   return (
      <div className="flex items-center">
         <CartModal />
      </div>
   );
}
