'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export const MetaPixelEvents: React.FC = () => {
   const pathname = usePathname();
   const searchParams = useSearchParams();

   useEffect(() => {
      import('react-facebook-pixel')
         .then((module) => module.default)
         .then((ReactPixel) => {
            ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '');
            ReactPixel.pageView();
         });
   }, [pathname, searchParams]);

   return null;
};
