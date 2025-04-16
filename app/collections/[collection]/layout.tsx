'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

// import ClientDynamicSizeFilter from 'components/filters/ClientDynamicSizeFilter';
import FilterList from 'components/layout/search/filter';
import { sorting } from 'lib/constants';

type Props = { children: React.ReactNode };

export default function CollectionsLayout({ children }: Props) {
   const pathname = usePathname() || '';
   const isProductPage = pathname.includes('/products/');

   // If we’re on a product page, just render the content full‑width
   if (isProductPage) {
      return <main className="max-w-screen-full mx-auto px-4 pb-4">{children}</main>;
   }

   // Otherwise, render the two‑column filter + sort layout
   return (
      <div className="max-w-screen-full mx-auto flex flex-col gap-8 px-1 pb-4 pt-4 text-black dark:text-white md:flex-row xl:p-6">
         <aside className="order-first w-full flex-none md:max-w-[150px]">
            {/* <ClientDynamicSizeFilter letters={[]} numerics={[]} /> */}
         </aside>

         <main className="order-last min-h-screen w-full md:order-none">{children}</main>

         <aside className="order-none flex-none md:order-last md:w-[150px]">
            <FilterList list={sorting} title="Sort by" />
         </aside>
      </div>
   );
}
