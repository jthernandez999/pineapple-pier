'use client';

import { useEffect, useState } from 'react';
import Navbar from './index'; // Import your existing SSR Navbar component

export default function ScrollNavbar() {
   const [showNavbar, setShowNavbar] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         setShowNavbar(window.scrollY > 100);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return showNavbar ? <Navbar /> : null;
}
