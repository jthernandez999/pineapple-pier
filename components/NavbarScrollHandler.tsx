'use client';

import { useEffect } from 'react';

const NavbarScrollHandler = () => {
   const navbarHeight = 104; // Adjust to your navbar's height in pixels

   useEffect(() => {
      const navElement = document.querySelector('nav'); // Select the nav element
      const desktopMenuId = document.getElementById('desktop-menu'); // ID of the desktop menu

      // Function to handle scroll and change classes
      const handleScroll = () => {
         // Always re-check the current path. Because the world changes, apparently.
         const currentPath = window.location.pathname;
         const isHomepage = currentPath === '/';
         const isCollectionPage = currentPath.includes('/collections/');
         const isProductPage = currentPath.includes('/product/');
         const isProductsPage = currentPath.includes('/products/');
         const isSearchPage = currentPath.includes('/search');
         const isCartPage = currentPath.includes('/cart');
         const isAccountPage = currentPath.includes('/account');

         if (navElement && desktopMenuId) {
            if (
               isHomepage &&
               !isCollectionPage &&
               !isProductPage &&
               !isProductsPage &&
               !isSearchPage &&
               !isCartPage &&
               !isAccountPage
            ) {
               // Homepage behavior: transition effects based on scroll position
               if (window.scrollY > navbarHeight) {
                  navElement.classList.remove(
                     'absolute',
                     'lg:top-20',
                     'top-10',
                     'bg-white-opacity-0'
                  );
                  desktopMenuId.classList.remove('md:hidden', 'lg:hidden');
                  navElement.classList.add(
                     'sticky',
                     'top-0',
                     'lg:top-0',
                     'shadow-md',
                     'bg-white',
                     'bg-opacity-100', // Full opacity when sticky
                     'transition-all',
                     'duration-[2000ms]',
                     'ease-in-out'
                  );
                  desktopMenuId.classList.add('md:block');
               } else {
                  navElement.classList.add(
                     'absolute',
                     'lg:top-20',
                     'top-0',
                     'bg-transparent',
                     'bg-opacity-0', // Transparent background when not sticky
                     'transition-all',
                     'duration-[2000ms]',
                     'ease-in-out',
                     `bottom-[-${navbarHeight}px]`
                  );
                  desktopMenuId.classList.add('md:hidden');
                  desktopMenuId.classList.remove('md:block');
                  navElement.classList.remove(
                     'sticky',
                     'bg-white',
                     'shadow-md',
                     'lg:top-0',
                     'top-0'
                  );
               }
            } else {
               // Other pages: always sticky without fancy transitions
               navElement.classList.remove(
                  'absolute',
                  'lg:top-20',
                  'top-10',
                  'bg-transparent',
                  'bg-opacity-0'
               );
               navElement.classList.add(
                  'sticky',
                  'top-0',
                  'z-30',
                  'bg-white',
                  'bg-opacity-100',
                  'transition-none'
               );
               desktopMenuId.classList.remove('md:hidden', 'lg:hidden');
               desktopMenuId.classList.add('md:block', 'lg:block');
            }
         }
      };

      // Listen for scroll event
      window.addEventListener('scroll', handleScroll);

      // Initial check for the navbar behavior on page load
      handleScroll();

      // Cleanup the event listener when the component is unmounted
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, [navbarHeight]);

   return null; // This component doesn't render anything
};

export default NavbarScrollHandler;
