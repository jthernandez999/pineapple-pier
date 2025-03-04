'use client';

import { useEffect } from 'react';

const NavbarScrollHandler = () => {
   const navbarHeight = 104; // Adjust to your navbar's height in pixels

   useEffect(() => {
      // Check if the current path is the homepage, collection page or product page
      const navElement = document.querySelector('nav'); // Select the nav element
      const desktopMenuId = document.getElementById('desktop-menu'); // ID of the desktop menu

      const isHomepage = window.location.pathname === '/';
      const isCollectionPage = window.location.pathname.includes('/collections/');
      const isProductPage = window.location.pathname.includes('/product/');
      const isSearchPage = window.location.pathname.includes('/search');

      // Function to handle scroll and change classes
      const handleScroll = () => {
         const navbarHeight = 104; // Adjust based on your navbar's height
         if (navElement && desktopMenuId && window.location.pathname === '/') {
            if (isHomepage && !isCollectionPage && !isProductPage && !isSearchPage) {
               // Only apply scroll behavior on homepage
               if (window.scrollY > navbarHeight) {
                  // When scrolled past the threshold, add sticky and remove absolute
                  navElement.classList.remove(
                     'absolute',
                     'lg:top-20',
                     'top-10',
                     'bg-white-opacity-0'
                  );
                  desktopMenuId.classList.remove('md:hidden');
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
                  // When scrolled back up, add absolute and remove sticky
                  navElement.classList.add(
                     'absolute',
                     'lg:top-20',
                     'top-10',
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
               // For all other pages, maintain sticky navbar without transition
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

               desktopMenuId.classList.remove('md:hidden');
               desktopMenuId.classList.add('md:block');
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

   return null; // This component doesn't render anything, it just handles the scroll behavior
};

export default NavbarScrollHandler;
