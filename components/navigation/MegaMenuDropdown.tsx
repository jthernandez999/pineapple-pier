'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MenuItem } from 'lib/shopify/types';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface MegaMenuClientProps {
   item: MenuItem;
}

export default function MegaMenuClient({ item }: MegaMenuClientProps) {
   const [open, setOpen] = useState(false);
   const [topOffset, setTopOffset] = useState<number>(0);
   const containerRef = useRef<HTMLLIElement>(null);
   const hideTimeout = useRef<number | undefined>(undefined);

   // measure nav bottom
   useEffect(() => {
      const updateOffset = () => {
         const nav = document.querySelector('nav');
         if (nav) setTopOffset(nav.getBoundingClientRect().bottom);
      };
      updateOffset();
      window.addEventListener('resize', updateOffset);
      window.addEventListener('scroll', updateOffset);
      return () => {
         window.removeEventListener('resize', updateOffset);
         window.removeEventListener('scroll', updateOffset);
         if (hideTimeout.current !== undefined) {
            clearTimeout(hideTimeout.current);
         }
      };
   }, []);

   // close on click outside
   useEffect(() => {
      const onClickOutside = (e: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setOpen(false);
         }
      };
      document.addEventListener('click', onClickOutside);
      return () => document.removeEventListener('click', onClickOutside);
   }, []);

   const onMouseEnter = () => {
      clearTimeout(hideTimeout.current);
      setOpen(true);
   };

   const onMouseLeave = () => {
      hideTimeout.current = window.setTimeout(() => setOpen(false), 200);
   };

   const hasSubmenu = Array.isArray(item.items) && item.items.length > 0;

   return (
      <li
         ref={containerRef}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}
         className="relative"
      >
         <Link
            href={item.url}
            className="inline-flex justify-center px-3 py-2.5 text-xs font-semibold tracking-wide text-black hover:text-gray-700"
         >
            {item.title}
         </Link>

         <AnimatePresence>
            {hasSubmenu && open && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ top: topOffset }}
                  className="fixed left-0 z-[65] min-h-[25vh] w-full bg-white shadow-lg"
               >
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ delay: 0.1, duration: 0.2 }}
                  >
                     <div className="flex justify-around px-8 py-4">
                        <ul className="flex space-x-8">
                           {item.items!.map((sub) => (
                              <li key={sub.title} className="text-left">
                                 <Link
                                    href={sub.url}
                                    className="block py-2 text-sm font-normal text-gray-900 hover:text-gray-400"
                                 >
                                    {sub.title}
                                 </Link>
                                 {sub.items && (
                                    <ul className="ml-4 mt-2 space-y-2">
                                       {sub.items.map((nested) => (
                                          <li key={nested.title}>
                                             <Link
                                                href={nested.url}
                                                className="block text-sm text-gray-700 hover:bg-gray-100"
                                             >
                                                {nested.title}
                                             </Link>
                                          </li>
                                       ))}
                                    </ul>
                                 )}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </li>
   );
}
