'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { announcements } from './../assets/index';

const socialMediaData = [
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

// SocialIcons component with thinner icons (20px) and subtle hover effects.
const SocialIcons: React.FC = React.memo(() => (
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
               width={20}
               height={20}
               priority
               className="h-5 w-5 object-contain brightness-0 invert filter"
            />
            <span className="sr-only">{social.name}</span>
         </Link>
      ))}
   </div>
));

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
      <div className="relative w-full border-t border-yellow-500 bg-gradient-to-r from-gray-900 to-black text-white shadow-lg">
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
            {/* Social icons positioned far left on desktop */}
            <div className="absolute left-4 hidden md:flex">
               <SocialIcons />
            </div>
         </div>
      </div>
   );
};

export default AnnouncementBar;
