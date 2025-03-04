'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Menu } from 'lib/shopify/types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Fragment, Suspense, useEffect, useState } from 'react';
import Search, { SearchSkeleton } from './search';

export default function MobileMenu({ menu }: { menu: Menu[] }) {
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const [isOpen, setIsOpen] = useState(false);
   // openSubMenu will store the title of the menu item whose submenu is open.
   const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

   const openMobileMenu = () => setIsOpen(true);
   const closeMobileMenu = () => {
      setIsOpen(false);
      setOpenSubMenu(null);
   };

   // Close mobile menu on resize if the viewport exceeds mobile size.
   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth > 768) {
            closeMobileMenu();
         }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   // Close mobile menu if the route changes.
   useEffect(() => {
      closeMobileMenu();
   }, [pathname, searchParams]);

   // Handle clicking on a top-level menu item.
   const handleTopLevelClick = (item: Menu) => {
      // If there are sub-items, toggle the submenu.
      if (item.items && item.items.length > 0) {
         setOpenSubMenu((prev) => (prev === item.title ? null : item.title));
      } else {
         // Otherwise, close the menu and navigate.
         closeMobileMenu();
      }
   };

   return (
      <>
         <button
            onClick={openMobileMenu}
            aria-label="Open mobile menu"
            className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white md:hidden"
         >
            <Bars3Icon className="h-4" />
         </button>
         <Transition show={isOpen}>
            <Dialog onClose={closeMobileMenu} className="relative z-[66]">
               <Transition.Child
                  as={Fragment}
                  enter="transition-all ease-in-out duration-300"
                  enterFrom="opacity-0 backdrop-blur-none"
                  enterTo="opacity-100 backdrop-blur-[.5px]"
                  leave="transition-all ease-in-out duration-200"
                  leaveFrom="opacity-100 backdrop-blur-[.5px]"
                  leaveTo="opacity-0 backdrop-blur-none"
               >
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
               </Transition.Child>
               <Transition.Child
                  as={Fragment}
                  enter="transition-all ease-in-out duration-300"
                  enterFrom="translate-x-[-100%]"
                  enterTo="translate-x-0"
                  leave="transition-all ease-in-out duration-200"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-[-100%]"
               >
                  <Dialog.Panel className="fixed inset-0 flex h-full w-full flex-col bg-white pb-6 dark:bg-black">
                     <div className="p-4">
                        <button
                           className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
                           onClick={closeMobileMenu}
                           aria-label="Close mobile menu"
                        >
                           <XMarkIcon className="h-6" />
                        </button>
                        <div className="mb-4 w-full">
                           <Suspense fallback={<SearchSkeleton />}>
                              <Search />
                           </Suspense>
                        </div>
                        {menu.length ? (
                           <ul className="flex w-full flex-col">
                              {menu.map((item: Menu) => (
                                 <li
                                    key={item.title}
                                    className="py-2 text-xl text-black transition-colors hover:text-neutral-500 dark:text-white"
                                 >
                                    {item.items && item.items.length > 0 ? (
                                       <>
                                          <button
                                             onClick={() => handleTopLevelClick(item)}
                                             className="flex w-full items-center justify-between"
                                          >
                                             <span>{item.title}</span>
                                             {openSubMenu === item.title ? (
                                                <svg className="h-6 w-6" viewBox="0 0 24 24">
                                                   <line
                                                      x1="5"
                                                      y1="12"
                                                      x2="19"
                                                      y2="12"
                                                      stroke="currentColor"
                                                      strokeWidth=".75"
                                                      strokeLinecap="round"
                                                   />
                                                </svg>
                                             ) : (
                                                <svg className="h-6 w-6" viewBox="0 0 24 24">
                                                   <line
                                                      x1="12"
                                                      y1="5"
                                                      x2="12"
                                                      y2="19"
                                                      stroke="currentColor"
                                                      strokeWidth=".75"
                                                      strokeLinecap="round"
                                                   />
                                                   <line
                                                      x1="5"
                                                      y1="12"
                                                      x2="19"
                                                      y2="12"
                                                      stroke="currentColor"
                                                      strokeWidth=".75"
                                                      strokeLinecap="round"
                                                   />
                                                </svg>
                                             )}
                                          </button>
                                          {openSubMenu === item.title && (
                                             <ul className="ml-4 mt-2 flex flex-col space-y-2">
                                                {item.items.map((subItem) => (
                                                   <li key={subItem.title}>
                                                      <Link
                                                         href={subItem.path}
                                                         onClick={closeMobileMenu}
                                                         className="text-md block font-semibold text-gray-700 hover:text-gray-900"
                                                      >
                                                         {subItem.title}
                                                      </Link>
                                                   </li>
                                                ))}
                                             </ul>
                                          )}
                                       </>
                                    ) : (
                                       <Link
                                          href={item.path}
                                          prefetch={true}
                                          onClick={closeMobileMenu}
                                       >
                                          {item.title}
                                       </Link>
                                    )}
                                 </li>
                              ))}
                           </ul>
                        ) : null}
                     </div>
                  </Dialog.Panel>
               </Transition.Child>
            </Dialog>
         </Transition>
      </>
   );
}
