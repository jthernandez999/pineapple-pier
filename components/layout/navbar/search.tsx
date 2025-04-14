'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { graphQLClient } from 'lib/graphqlClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

// Define the predictive search query as a string.
const PREDICTIVE_SEARCH_QUERY = `
  query suggestions($query: String!) {
    predictiveSearch(query: $query) {
      queries {
        text
      }
      collections {
        id
      }
      products {
        id
      }
      pages {
        id
      }
      articles {
        id
      }
    }
  }
`;

export default function Search() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const [isPopupOpen, setIsPopupOpen] = useState(false);
   // Popular searches state (used in the desktop popup)
   const [popularSearches, setPopularSearches] = useState<{ query: string; score: number }[]>([]);
   const popupInputRef = useRef<HTMLInputElement>(null);
   const popupRef = useRef<HTMLDivElement>(null);

   // Use a shared controlled state for the search query (for both mobile and desktop)
   const [popupQuery, setPopupQuery] = useState(searchParams?.get('q') || '');

   // Local state to manage predictive search suggestion data
   const [predictiveData, setPredictiveData] = useState<any>(null);
   const [predictiveLoading, setPredictiveLoading] = useState(false);
   const [predictiveError, setPredictiveError] = useState<Error | null>(null);

   // Fetch predictive suggestions whenever popupQuery changes.
   useEffect(() => {
      if (popupQuery.trim() === '') {
         setPredictiveData(null);
         return;
      }
      setPredictiveLoading(true);
      setPredictiveError(null);
      graphQLClient(PREDICTIVE_SEARCH_QUERY, { query: popupQuery })
         .then((data) => setPredictiveData(data))
         .catch((error) => setPredictiveError(error))
         .finally(() => setPredictiveLoading(false));
   }, [popupQuery]);

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

   // Focus the input when the desktop popup opens.
   useEffect(() => {
      if (isPopupOpen && popupInputRef.current) {
         popupInputRef.current.focus();
      }
   }, [isPopupOpen]);

   // Close the popup when clicking outside (desktop).
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
         // Record the search in Redis.
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

         {/* Mobile: Full search form with predictive search */}
         <div className="block lg:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
               <input
                  type="text"
                  name="q"
                  placeholder="Search for products..."
                  autoComplete="off"
                  value={popupQuery}
                  onChange={(e) => setPopupQuery(e.target.value)}
                  className="text-md dark:placeholder:text-black-400 w-full rounded-lg border bg-white px-4 py-2 text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-black md:text-sm"
               />
               <button
                  type="submit"
                  className="absolute right-0 top-0 mr-3 flex h-full items-center"
               >
                  <MagnifyingGlassIcon className="h-4" />
               </button>
            </form>
            {popupQuery.trim() !== '' && (
               <div className="mt-4">
                  {predictiveLoading && (
                     <p className="text-sm text-gray-500">Loading suggestions...</p>
                  )}
                  {predictiveError && (
                     <p className="text-sm text-red-500">Error: {predictiveError.message}</p>
                  )}
                  {predictiveData && predictiveData.predictiveSearch && (
                     <>
                        {predictiveData.predictiveSearch.queries.length > 0 ? (
                           <ul className="space-y-2">
                              {predictiveData.predictiveSearch.queries.map(
                                 (suggestion: any, idx: number) => (
                                    <li
                                       key={`suggestion-${idx}`}
                                       className="cursor-pointer rounded p-1 hover:bg-gray-100"
                                       onClick={() => {
                                          setPopupQuery(suggestion.text);
                                          router.push(
                                             `/search?q=${encodeURIComponent(suggestion.text)}`
                                          );
                                       }}
                                    >
                                       {suggestion.text}
                                    </li>
                                 )
                              )}
                           </ul>
                        ) : (
                           <p className="text-sm text-gray-500">No suggestions found</p>
                        )}
                     </>
                  )}
               </div>
            )}
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
                                    setPopupQuery(item.query);
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
                        name="q"
                        type="text"
                        placeholder="Search for products..."
                        autoComplete="off"
                        value={popupQuery}
                        onChange={(e) => setPopupQuery(e.target.value)}
                        className="text-md dark:placeholder:text-black-400 w-full rounded-lg border bg-white px-4 py-2 text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-black md:text-sm"
                     />
                     <button
                        type="submit"
                        className="absolute right-0 top-0 mr-3 flex h-full items-center"
                     >
                        <MagnifyingGlassIcon className="m-0 h-4 p-0" />
                     </button>
                  </form>
                  {popupQuery.trim() !== '' && (
                     <div className="mt-4 border-t pt-4">
                        {predictiveLoading && (
                           <p className="text-sm text-gray-500">Loading suggestions...</p>
                        )}
                        {predictiveError && (
                           <p className="text-sm text-red-500">Error: {predictiveError.message}</p>
                        )}
                        {predictiveData && predictiveData.predictiveSearch && (
                           <>
                              {predictiveData.predictiveSearch.queries.length > 0 ? (
                                 <ul className="space-y-2">
                                    {predictiveData.predictiveSearch.queries.map(
                                       (suggestion: any, idx: number) => (
                                          <li
                                             key={`suggestion-${idx}`}
                                             className="cursor-pointer rounded p-1 hover:bg-gray-100"
                                             onClick={() => {
                                                setPopupQuery(suggestion.text);
                                                setIsPopupOpen(false);
                                                router.push(
                                                   `/search?q=${encodeURIComponent(suggestion.text)}`
                                                );
                                             }}
                                          >
                                             {suggestion.text}
                                          </li>
                                       )
                                    )}
                                 </ul>
                              ) : (
                                 <p className="text-sm text-gray-500">No suggestions found</p>
                              )}
                           </>
                        )}
                     </div>
                  )}
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
