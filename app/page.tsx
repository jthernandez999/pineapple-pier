// app/page.tsx
import { banners, collectionImages, highlightCollectionImages } from 'assets/index';
import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import HeroBanner from 'components/hero';
import HighlightCollection from 'components/highlightCollection';
import Footer from 'components/layout/footer';
import ProductGroupsDisplay from 'components/product/ProductGroupsDisplay';
import ThreeImageCollections from 'components/three-collections';
import { ProductGroup } from 'lib/shopify/types';

export const metadata = {
   description: 'Dear John Denim, a premium denim brand that offers a wide range of denim',
   openGraph: {
      type: 'website'
   }
};

// This tells Next.js to revalidate the page every 60 seconds.
export const revalidate = 60;

export default async function HomePage() {
   // Fetch your product groups metaobject from Shopify.
   const SHOPIFY_ENDPOINT = process.env.SHOPIFY_GRAPHQL_ENDPOINT;
   console.log('SHOPIFY_ENDPOINT:', SHOPIFY_ENDPOINT);
   if (!SHOPIFY_ENDPOINT) {
      throw new Error('SHOPIFY_GRAPHQL_ENDPOINT is not defined');
   }

   const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
   if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      throw new Error('SHOPIFY_STOREFRONT_TOKEN is not defined');
   }

   const query = `
  query GetProductGroups($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      fields {
        key
        value
      }
    }
  }
`;

   const variables = {
      handle: {
         handle: 'yanis-top',
         type: 'product_groups'
      }
   };

   const res = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables })
   });

   const json = await res.json();
   console.log('GraphQL response:', json);

   const metaobject = json.data?.metaobject;
   let groups: ProductGroup[] = [];

   if (metaobject) {
      // Assuming one of the fields is "groups" holding a JSON-encoded string.
      const groupsField = metaobject.fields.find(
         (field: { key: string }) => field.key === 'groups'
      );
      if (groupsField) {
         try {
            groups = JSON.parse(groupsField.value);
         } catch (error) {
            console.error('Error parsing product groups:', error);
         }
      }
      console.log('Metaobject fields:', JSON.stringify(metaobject.fields, null, 2));
   }

   return (
      <>
         <HeroBanner banners={banners} interval={1100} />
         <ThreeImageCollections collectionImages={collectionImages} />
         <Carousel />
         <HighlightCollection highlightCollectionImages={highlightCollectionImages} />
         <ThreeItemGrid />
         {/* Render the Product Groups section if data exists */}
         {groups.length > 0 ? (
            <section className="my-12">
               <h2 className="mb-8 text-center text-4xl font-bold">Product Groups</h2>
               <ProductGroupsDisplay groups={groups} />
            </section>
         ) : (
            <p className="text-center text-gray-500">No product groups found.</p>
         )}
         <Footer />
      </>
   );
}

// import { banners, collectionImages, highlightCollectionImages } from 'assets/index';
// import { Carousel } from 'components/carousel';
// import { ThreeItemGrid } from 'components/grid/three-items';
// import HeroBanner from 'components/hero';
// import HighlightCollection from 'components/highlightCollection';
// import Footer from 'components/layout/footer';
// import ThreeImageCollections from 'components/three-collections';

// export const metadata = {
//    description: 'Dear John Denim, a premium denim brand that offers a wide range of denim',
//    openGraph: {
//       type: 'website'
//    }
// };

// export default function HomePage() {
//    return (
//       <>
//          <HeroBanner banners={banners} interval={1100} />
//          <ThreeImageCollections collectionImages={collectionImages} />
//          <Carousel />
//          <HighlightCollection highlightCollectionImages={highlightCollectionImages} />
//          <ThreeItemGrid />
//          <Footer />
//       </>
//    );
// }
