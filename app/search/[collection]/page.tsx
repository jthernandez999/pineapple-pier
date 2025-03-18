// pages/collection/[collection]/page.tsx
import Grid from 'components/grid';
import { collectionSorting, defaultCollectionSort } from 'lib/constants';
import { getCollection, getCollectionProducts } from 'lib/shopify';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InfiniteScrollProductGrid from '../../../components/InfiniteProductGrid';

export async function generateMetadata(props: {
   params: Promise<{ collection: string }>;
}): Promise<Metadata> {
   const params = await props.params;
   const collection = await getCollection(params.collection);

   if (!collection) return notFound();

   return {
      title: collection.seo?.title || collection.title,
      description:
         collection.seo?.description || collection.description || `${collection.title} products`
   };
}

export default async function CategoryPage(props: {
   params: Promise<{ collection: string }>;
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
   const searchParams = await props.searchParams;
   const params = await props.params;
   const { sort } = searchParams as { [key: string]: string };
   const { sortKey, reverse } =
      collectionSorting.find((item) => item.slug === sort) || defaultCollectionSort;

   // Destructure to get both products and pageInfo
   const { products, pageInfo } = await getCollectionProducts({
      collection: params.collection,
      sortKey,
      reverse
   });
   // this is the title converted to uppercase without the dashes
   const collectionTitle = params.collection.replace(/-/g, ' ').toUpperCase();
   return (
      <section>
         {products.length === 0 ? (
            <p className="py-3 text-lg">No products found in this collection</p>
         ) : (
            <>
               <h1 className="border-b-2 border-gray-200 bg-gray-100 py-4 pl-4 text-left font-poppins text-xl uppercase tracking-wider">
                  {collectionTitle}
               </h1>
               <Grid className="container mx-auto w-full max-w-[100vw] px-0 md:px-4 lg:px-4">
                  <InfiniteScrollProductGrid
                     initialProducts={products}
                     initialPageInfo={pageInfo}
                     collectionHandle={params.collection}
                     sortKey={sortKey}
                     reverse={reverse}
                  />
               </Grid>
            </>
         )}
      </section>
   );
}
