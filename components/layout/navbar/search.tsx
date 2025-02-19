'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Search() {
   const searchParams = useSearchParams();
   const [isPopupOpen, setIsPopupOpen] = useState(false);
   const [popularSearches, setPopularSearches] = useState([]);
   const popupInputRef = useRef(null);

   useEffect(() => {
      // Fetch legitimate popular searches from your website
      async function fetchPopularSearches() {
         try {
            const response = await fetch('/api/popular-searches');
            const data = await response.json();
            setPopularSearches(data.searches);
         } catch (error) {
            console.error('Failed to fetch popular searches:', error);
         }
      }
      fetchPopularSearches();
   }, []);

   // Focus the input when the popup opens
   useEffect(() => {
      if (isPopupOpen && popupInputRef.current) {
         popupInputRef.current.focus();
      }
   }, [isPopupOpen]);

   const togglePopup = () => setIsPopupOpen((prev) => !prev);

   // When search is submitted, close the popup
   const handleSearchSubmit = () => {
      setIsPopupOpen(false);
   };

   return (
      <div className="relative">
         {/* Desktop: Magnifying glass next to the cart */}
         <div className="ml-auto hidden items-center lg:flex">
            <button onClick={togglePopup} className="p-2">
               <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
         </div>

         {/* Mobile: Show full search form */}
         <div className="block lg:hidden">
            <Form action="/search" className="relative w-full">
               <input
                  key={searchParams?.get('q')}
                  type="text"
                  name="q"
                  placeholder="Search for products..."
                  autoComplete="off"
                  defaultValue={searchParams?.get('q') || ''}
                  className="text-md dark:placeholder:text-black-400 w-full rounded-lg border bg-white px-4 py-2 text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-black md:text-sm"
               />
               <button
                  type="submit"
                  className="absolute right-0 top-0 mr-3 flex h-full items-center"
               >
                  <MagnifyingGlassIcon className="h-4" />
               </button>
            </Form>
         </div>

         {/* Desktop Full-Width Pop-up */}
         {isPopupOpen && (
            <div className="fixed left-0 top-16 z-50 w-full bg-white shadow-lg">
               <div className="mx-auto max-w-screen-xl px-4 py-6">
                  <div className="mb-4 flex items-center justify-between">
                     <h2 className="text-xl font-semibold text-black">What are you looking for?</h2>
                     <button onClick={togglePopup} className="text-2xl font-bold text-black">
                        &times;
                     </button>
                  </div>
                  <div>
                     <p className="mb-2 text-sm font-medium text-gray-700">POPULAR SEARCHES:</p>
                     <ul className="flex flex-wrap gap-4">
                        {popularSearches.length > 0 ? (
                           popularSearches.map((search) => (
                              <li
                                 key={search}
                                 className="cursor-pointer text-blue-500 hover:underline"
                              >
                                 {search}
                              </li>
                           ))
                        ) : (
                           <li className="text-gray-500">No popular searches available</li>
                        )}
                     </ul>
                  </div>
                  <Form action="/search" className="relative mt-4" onSubmit={handleSearchSubmit}>
                     <input
                        ref={popupInputRef}
                        key={searchParams?.get('q')}
                        type="text"
                        name="q"
                        placeholder="Search for products..."
                        autoComplete="off"
                        defaultValue={searchParams?.get('q') || ''}
                        className="text-md dark:placeholder:text-black-400 w-full rounded-lg border bg-white px-4 py-2 text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-black md:text-sm"
                     />
                     <button
                        type="submit"
                        className="absolute right-0 top-0 mr-3 flex h-full items-center"
                     >
                        <MagnifyingGlassIcon className="h-4" />
                     </button>
                  </Form>
               </div>
            </div>
         )}
      </div>
   );
}

export function SearchSkeleton() {
   return (
      <form className="relative w-full">
         <input
            placeholder="Search for products..."
            className="dark:placeholder:text-black-400 w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-black"
         />
         <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
            <MagnifyingGlassIcon className="h-4" />
         </div>
      </form>
   );
}
