import Collections from 'components/layout/search/collections';
import FilterList from 'components/layout/search/filter';
import { sorting } from 'lib/constants';
import ChildrenWrapper from './children-wrapper';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <div className="max-w-screen-full mx-auto flex flex-col gap-8 px-[0.10rem] pb-4 pt-4 text-black dark:text-white md:flex-row md:px-[0.20rem] xl:p-6">
            <div className="order-first w-full flex-none md:max-w-[150px]">
               <Collections />
            </div>
            <div className="order-last min-h-screen w-full md:order-none">
               <ChildrenWrapper>{children}</ChildrenWrapper>
            </div>
            <div className="order-none flex-none md:order-last md:w-[150px]">
               <FilterList list={sorting} title="Sort by" />
            </div>
         </div>
         {/* <Footer /> */}
      </>
   );
}
