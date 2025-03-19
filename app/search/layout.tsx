import Footer from 'components/layout/footer';
import Collections from 'components/layout/search/collections';
import FilterList from 'components/layout/search/filter';
import { sorting } from 'lib/constants';
import ChildrenWrapper from './children-wrapper';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <div className="max-w-screen-full mx-auto flex flex-col gap-8 px-4 pb-4 text-black dark:text-white md:flex-row">
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
         <Footer />
      </>
   );
}
