'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { announcements } from './../assets/index';

const AnnouncementBar: React.FC = () => {
   const [currentIndex, setCurrentIndex] = useState<number>(0);

   useEffect(() => {
      if (announcements.length > 1) {
         const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
         }, 5000);
         return () => clearInterval(interval);
      }
   }, []);

   const { message, linkText, linkUrl } = announcements[currentIndex] || {};

   return (
      <div className="relative w-full border-t border-yellow-500 bg-gradient-to-b from-black to-neutral-800 text-white shadow-lg">
         <div className="container mx-auto flex items-center justify-center px-4 py-1 md:py-2">
            {/* Announcement message centered */}
            <div className="text-center">
               <span className="animate-fadeIn font-poppins text-xs tracking-wide">{message}</span>
               {linkUrl && (
                  <Link
                     href={linkUrl}
                     className="ml-2 text-xs underline transition-colors duration-300 hover:opacity-75"
                  >
                     {linkText}
                  </Link>
               )}
            </div>
         </div>
      </div>
   );
};

export default AnnouncementBar;
