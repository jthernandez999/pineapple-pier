'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const resetNavbarClasses = () => {
   const navElement = document.querySelector('nav');
   const desktopMenuId = document.getElementById('desktop-menu');
   const mobileMenuId = document.getElementById('mobile-menu');
   const searchCartId = document.getElementById('search-cart');

   if (navElement && desktopMenuId && mobileMenuId && searchCartId) {
      // Reset nav to its default homepage classes
      navElement.className =
         'bg-white-opacity-0 absolute top-0 z-[66] mt-5 w-full border-gray-200 dark:border-gray-600 dark:bg-gray-900 lg:top-20';
      // Reset the desktop menu to default (hidden)
      desktopMenuId.className = 'hidden md:hidden lg:hidden';
      // Reset the mobile menu to default (hidden) for homepage
      mobileMenuId.className = 'hidden md:hidden';
      // Reset the search/cart to default (hidden)
      searchCartId.className = 'hidden';
   }
};

const NavbarScrollHandler = () => {
   const navbarHeight = 25; // Adjust to your navbar's height in pixels
   const pathname = usePathname();
   const [isMounted, setIsMounted] = useState(false);

   // Ensure the component is mounted before using routing info
   useEffect(() => {
      setIsMounted(true);
   }, []);

   // When navigating to the homepage, reset classes and scroll to top
   useEffect(() => {
      if (!isMounted) return;
      if (pathname === '/') {
         resetNavbarClasses();
         window.scrollTo(0, 0);
      }
   }, [pathname, isMounted]);

   useEffect(() => {
      if (!isMounted) return;
      const navElement = document.querySelector('nav');
      const desktopMenuId = document.getElementById('desktop-menu');
      const mobileMenuId = document.getElementById('mobile-menu');
      const searchCartId = document.getElementById('search-cart');

      const handleScroll = () => {
         const currentPath = window.location.pathname;
         const isHomepage = currentPath === '/';
         const isCollectionPage = currentPath.includes('/collections/');
         const isProductPage = currentPath.includes('/product/');
         const isProductsPage = currentPath.includes('/products/');
         const isSearchPage = currentPath.includes('/search');
         const isCartPage = currentPath.includes('/cart');
         const isAccountPage = currentPath.includes('/account');

         if (navElement && desktopMenuId && mobileMenuId && searchCartId) {
            if (
               isHomepage &&
               !isCollectionPage &&
               !isProductPage &&
               !isProductsPage &&
               !isSearchPage &&
               !isCartPage &&
               !isAccountPage
            ) {
               if (window.scrollY > navbarHeight) {
                  // Scrolled state on homepage: show mobile menu
                  navElement.classList.remove(
                     'absolute',
                     'lg:top-20',
                     'top-10',
                     'mt-5',
                     'bg-white-opacity-0'
                  );
                  desktopMenuId.classList.remove('md:hidden', 'lg:hidden');
                  mobileMenuId.classList.remove('hidden');
                  searchCartId.classList.remove('hidden');
                  mobileMenuId.classList.add('block');
                  searchCartId.classList.add('flex', 'items-center', 'gap-4');
                  navElement.classList.add(
                     'sticky',
                     'top-0',
                     'lg:top-0',
                     'shadow-md',
                     'bg-white',
                     'bg-opacity-100',
                     'transition-all',
                     'duration-[2000ms]',
                     'ease-in-out'
                  );
                  desktopMenuId.classList.add('md:block');
               } else {
                  // Default homepage state: mobile menu hidden
                  navElement.classList.add(
                     'absolute',
                     'lg:top-20',
                     'top-10',
                     'mt-5',
                     'bg-white-opacity-0',
                     'transition-all',
                     'duration-[2000ms]',
                     'ease-in-out'
                  );
                  desktopMenuId.classList.add('md:hidden');
                  desktopMenuId.classList.remove('md:block');
                  mobileMenuId.classList.remove('block');
                  mobileMenuId.classList.add('hidden');
                  searchCartId.classList.remove('flex');
                  searchCartId.classList.add('hidden');
                  navElement.classList.remove(
                     'sticky',
                     'bg-white',
                     'shadow-md',
                     'lg:top-0',
                     'top-0'
                  );
               }
            } else {
               // Other pages (like collections, products, etc.): always sticky with full menu visible
               navElement.classList.remove(
                  'absolute',
                  'lg:top-20',
                  'top-10',
                  'bg-transparent',
                  'bg-opacity-0',
                  'mt-5'
               );
               navElement.classList.add(
                  'sticky',
                  'top-0',
                  'z-[66]', // keep this above the mega‑menu’s z‑index
                  'bg-white',
                  'bg-opacity-100',
                  'transition-none'
               );
               desktopMenuId.classList.remove('md:hidden', 'lg:hidden');
               desktopMenuId.classList.add('md:block', 'lg:block');
               // Make sure the mobile menu is visible on non-homepage routes
               mobileMenuId.classList.remove('hidden');
               mobileMenuId.classList.add('block');
               searchCartId.classList.remove('hidden');
               searchCartId.classList.add('flex');
            }
         }
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, [navbarHeight, isMounted]);

   return null;
};

export default NavbarScrollHandler;
