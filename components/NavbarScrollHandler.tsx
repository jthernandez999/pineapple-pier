'use client';

import { useEffect } from 'react';

const NavbarScrollHandler = () => {
   const navbarHeight = 100; // Adjust to your navbar's height in pixels

   useEffect(() => {
      const navElement = document.querySelector('nav'); // Select the nav element

      // Function to handle scroll and change classes
      const handleScroll = () => {
         if (navElement) {
            if (window.scrollY > navbarHeight) {
               // When scrolled past the threshold, add sticky and remove absolute
               navElement.classList.remove(
                  'absolute',
                  'lg:top-20',
                  'bg-white-opacity-0',
                  'top-10'
                  // `bottom-[-${navbarHeight}px]`
               );
               navElement.classList.add('sticky', 'top-0', 'lg:top-0', 'shadow-md', 'bg-white');
            } else {
               // When scrolled back up, add absolute and remove sticky
               navElement.classList.add(
                  'absolute',
                  'lg:top-20',
                  'top-10',
                  'bg-white-opacity-0',
                  `bottom-[-${navbarHeight}px]`
               );
               navElement.classList.remove('sticky', 'bg-white', 'shadow-md', 'lg:top-0', 'top-0');
            }
         }
      };

      // Listen for scroll event
      window.addEventListener('scroll', handleScroll);

      // Cleanup the event listener when the component is unmounted
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, [navbarHeight]);

   return <>{/* <AnimatedLogo /> */}</>;
};

export default NavbarScrollHandler;
