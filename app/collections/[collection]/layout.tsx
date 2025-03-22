// app/collections/[collection]/layout.tsx
// import ClientDynamicSizeFilter from 'components/filters/ClientDynamicSizeFilter';
// app/collections/[collection]/layout.tsx
import Footer from 'components/layout/footer';
import FilterList from 'components/layout/search/filter';
import { sorting } from 'lib/constants';
import React from 'react';

export interface CollectionsLayoutProps {
   children: React.ReactNode;
   params: { collection: string };
}

function CollectionsLayout({ children, params }: CollectionsLayoutProps) {
   return (
      <>
         <div className="max-w-screen-full mx-auto flex flex-col gap-8 px-[0.10rem] pb-4 pt-4 text-black dark:text-white md:flex-row md:px-[0.20rem] xl:p-6">
            <div className="order-first w-full flex-none md:max-w-[150px]">
               {/* <ClientDynamicSizeFilter letters={letters} numerics={numerics} /> */}
            </div>

            <div className="order-last min-h-screen w-full md:order-none">
               <main>{children}</main>
            </div>

            <div className="order-none flex-none md:order-last md:w-[150px]">
               <FilterList list={sorting} title="Sort by" />
            </div>
         </div>
         <Footer />
      </>
   );
}

export default CollectionsLayout;
