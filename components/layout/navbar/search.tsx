'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

export default function Search() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const [isPopupOpen, setIsPopupOpen] = useState(false);
   // Expecting an array of objects with { query, score }
   const [popularSearches, setPopularSearches] = useState<{ query: string; score: number }[]>([]);
   const popupInputRef = useRef<HTMLInputElement>(null);
   const popupRef = useRef<HTMLDivElement>(null);

   // Fetch the top popular searches from our API.
   useEffect(() => {
      async function fetchPopularSearches() {
         try {
            const response = await fetch('/api/popular-searches');
            const data = await response.json();
            setPopularSearches(data.searches || []);
         } catch (error) {
            console.error('Failed to fetch popular searches:', error);
         }
      }
      fetchPopularSearches();
   }, []);

   // Focus the input when the popup opens.
   useEffect(() => {
      if (isPopupOpen && popupInputRef.current) {
         popupInputRef.current.focus();
      }
   }, [isPopupOpen]);

   // Close the popup when clicking outside.
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (isPopupOpen && popupRef.current && !popupRef.current.contains(event.target as Node)) {
            setIsPopupOpen(false);
         }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [isPopupOpen]);

   const togglePopup = () => setIsPopupOpen((prev) => !prev);

   // Handles search submission: record the search and navigate.
   const handleSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const q = formData.get('q')?.toString() || '';
      if (!q.trim()) return;
      try {
         // Record the search in Redis
         await fetch('/api/popular-searches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q })
         });
      } catch (error) {
         console.error('Error recording search:', error);
      }
      setIsPopupOpen(false);
      router.push(`/search?q=${encodeURIComponent(q)}`);
   };

   return (
      <div className="relative">
         {/* Desktop: Magnifying glass button */}
         <div className="ml-auto hidden items-center lg:flex">
            <button onClick={togglePopup} className="p-2">
               <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
         </div>

         {/* Mobile: Full search form */}
         <div className="block lg:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
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
            </form>
         </div>

         {/* Desktop Full-Width Popup */}
         {isPopupOpen && (
            <div ref={popupRef} className="fixed left-0 top-16 z-50 w-full bg-white shadow-lg">
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
                           popularSearches.map((item) => (
                              <li
                                 key={item.query}
                                 className="cursor-pointer text-blue-500 hover:underline"
                                 onClick={() => {
                                    setIsPopupOpen(false);
                                    router.push(`/search?q=${encodeURIComponent(item.query)}`);
                                 }}
                              >
                                 {item.query} ({item.score})
                              </li>
                           ))
                        ) : (
                           <li className="text-gray-500">No popular searches available</li>
                        )}
                     </ul>
                  </div>
                  <form onSubmit={handleSearchSubmit} className="relative mt-4">
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
                        <MagnifyingGlassIcon className="m-0 h-4 p-0" />
                     </button>
                  </form>
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
