import CartModal from 'components/cart/modal';
import { getMenu } from 'lib/shopify';
import { Menu, MenuItem } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';
import AnimatedLogo from '../../../components/animated-logo';
import LoginModalTrigger from '../../../components/auth/ProfileAuthModal';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';
const { SITE_NAME } = process.env;

interface NavbarProps {
   siteName: string;
}

export async function Navbar() {
   // This component is SSR because it fetches data on the server.
   const menu: Menu[] = await getMenu('next-js-frontend-header-menu');

   return (
      // <nav className="sticky top-0 z-30 w-full border-gray-200 bg-white shadow-md dark:border-gray-600 dark:bg-gray-900">
      <nav className="bg-white-opacity-0 absolute top-10 z-[66] w-full border-gray-200 dark:border-gray-600 dark:bg-gray-900 lg:top-20">
         <div className="mx-auto flex w-full items-center justify-between p-4">
            {/* Left Section: Logo (and mobile menu icon) */}
            <div className="flex items-center">
               {/* Mobile Menu icon only shows on mobile */}
               <div className="block md:hidden">
                  <MobileMenu menu={menu} />
               </div>
               {/* Logo area */}
               <LogoArea />
            </div>

            {/* Center Section: Desktop Menu Items */}
            <div id="desktop-menu" className="hidden md:hidden lg:hidden">
               <DesktopMenu menu={menu} />
            </div>

            {/* Right Section: Search and Cart */}
            <div className="flex items-center gap-4">
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

// Helper component for the logo area.
function LogoArea() {
   return (
      <div className="flex items-center">
         <Link href="/" className="flex items-center gap-2">
            <AnimatedLogo />
            {/* <div className="ml-2 hidden text-sm font-medium uppercase md:block">{SITE_NAME}</div> */}
         </Link>
      </div>
   );
}

// Helper component for the desktop menu area.
function DesktopMenu({ menu }: { menu: Menu[] }) {
   return (
      <ul className="flex gap-12">
         {menu.map((item: MenuItem) => (
            <MegaMenuComponent key={item.title} item={item} />
         ))}
      </ul>
   );
}

// Helper component for the cart modal area.
function CartModalArea() {
   return (
      <div className="flex items-center">
         <CartModal />
      </div>
   );
}

// MegaMenuComponent remains largely unchanged.
interface MegaMenuComponentProps {
   item: MenuItem;
}
const MegaMenuComponent: React.FC<MegaMenuComponentProps> = ({ item }) => {
   const hasSubmenu = item.items && item.items.length > 0;
   return (
      <li className="group relative">
         <Link
            href={item.url}
            className="font-regular inline-flex w-full justify-center py-2.5 text-center text-sm tracking-widest text-black hover:text-gray-700"
         >
            {item.title}
         </Link>
         {hasSubmenu && (
            // The mega menu is now a fixed position element hover drop down menu.
            <div className="z-65 pointer-events-none fixed left-0 min-h-[25vh] w-full translate-y-4 transform bg-white opacity-0 transition-all delay-500 duration-1200 group-hover:pointer-events-auto group-hover:translate-y-16 group-hover:opacity-100 2xl:top-[2.2rem]">
               <div className="flex w-full justify-around px-8 py-4">
                  <ul className="flex justify-around space-x-8">
                     {item.items?.map((subItem) => (
                        <li key={subItem.title} className="text-left">
                           <Link
                              href={subItem.url}
                              className="font-regular block py-2 text-sm tracking-wide text-gray-700 hover:text-gray-900"
                           >
                              {subItem.title}
                           </Link>
                           {subItem.items && (
                              <ul className="ml-4 mt-2 space-y-2">
                                 {subItem.items.map((nestedItem) => (
                                    <li key={nestedItem.title} className="justify-start">
                                       <Link
                                          href={nestedItem.url}
                                          className="block text-sm text-gray-700 hover:bg-gray-100"
                                       >
                                          {nestedItem.title}
                                       </Link>
                                    </li>
                                 ))}
                              </ul>
                           )}
                        </li>
                     ))}
                  </ul>
                  {/* <div className="flex flex-col-reverse">
                     <NextImage
                        alt="Essential Tees"
                        src="https://cdn.shopify.com/s/files/1/1024/2207/files/essentialTees.jpg?v=1737503628"
                        width={200}
                        height={200}
                     />
                  </div> */}
               </div>
            </div>
         )}
      </li>
   );
};

export default Navbar;
