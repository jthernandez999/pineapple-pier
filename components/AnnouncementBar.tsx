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
         }, 5000); // Change message every 5 seconds
         return () => clearInterval(interval);
      }
   }, []);

   const { message, linkText, linkUrl } = announcements[currentIndex] || {};

   return (
      <div className="flex w-full justify-center bg-gray-100 p-2 text-center">
         <p className="flex text-sm text-gray-800">
            {message}

            <u>
               <Link href={linkUrl ?? '#'}>
                  <p className="pl-[.2rem] transition-opacity duration-200 hover:opacity-80">
                     {' '}
                     {linkText}
                  </p>
               </Link>
            </u>
         </p>
      </div>
   );
};

export default AnnouncementBar;
