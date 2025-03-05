import Grid from 'components/grid';
import InfiniteScrollProductGrid from 'components/InfiniteProductGrid';
import { defaultProductSort, productSorting } from 'lib/constants';
import { getProducts } from 'lib/shopify';

export const metadata = {
   title: 'Search',
   description: 'Search for products in the store.'
};

export default async function SearchPage(props: {
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
   const searchParams = await props.searchParams;
   const { sort, q: searchValue } = searchParams as { [key: string]: string };
   const { sortKey, reverse } =
      productSorting.find((item) => item.slug === sort) || defaultProductSort;

   const products = await getProducts({ sortKey, reverse, query: searchValue });
   const resultsText = products.length > 1 ? 'results' : 'result';

   return (
      <>
         {searchValue ? (
            <p className="mb-4">
               {products.length === 0
                  ? 'There are no products that match '
                  : `Showing ${products.length} ${resultsText} for `}
               <span className="font-bold">&quot;{searchValue}&quot;</span>
            </p>
         ) : null}
         {products.length > 0 ? (
            <Grid className="m-auto w-full">
               <InfiniteScrollProductGrid
                  initialProducts={products}
                  initialPageInfo={{ endCursor: null, hasNextPage: false }}
                  collectionHandle="search"
                  sortKey={sortKey}
                  reverse={reverse}
               />
            </Grid>
         ) : null}
      </>
   );
}
