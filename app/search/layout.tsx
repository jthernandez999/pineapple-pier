import Footer from 'components/layout/footer';
import Collections from 'components/layout/search/collections';
// import { FilterList } from '../../components/filters/filter-list';
import ChildrenWrapper from './children-wrapper';
export default function SearchLayout({ children }: { children: React.ReactNode }) {
   return (
      <>
         <div className="max-w-screen-3xl mx-auto flex flex-col gap-6 px-0 pb-4 text-black dark:text-white md:flex-row md:gap-4 md:px-4">
            <div className="order-first w-full flex-none md:max-w-[150px]">
               <Collections />
            </div>
            <div className="order-last min-h-screen w-full md:order-none">
               <ChildrenWrapper>{children}</ChildrenWrapper>
            </div>
            {/* <div className="order-none flex-none md:order-last md:w-[150px]"> */}
            {/* <FilterList title="Sort by" /> */}
            {/* </div> */}
         </div>
         <Footer />
      </>
   );
}
