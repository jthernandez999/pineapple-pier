'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

const MetaPixelEvents: React.FC = () => {
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

export default MetaPixelEvents;

//  This component will be rendered on every page and will trigger the Facebook Pixel page view event.
//  The  usePathname  and  useSearchParams  hooks are provided by the  next/navigation  package.
//  The  usePathname  hook returns the current pathname of the URL.
//  The  useSearchParams  hook returns the search parameters of the URL.
//  The  useEffect  hook will trigger the Facebook Pixel page view event when the component is mounted and when the pathname or search parameters change.
//  The  ReactPixel.init  method initializes the Facebook Pixel with the provided pixel ID.
//  The  ReactPixel.pageView  method triggers the page view event.
//  The  return null  statement will render nothing to the DOM.
