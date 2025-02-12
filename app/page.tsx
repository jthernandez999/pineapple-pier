// app/page.tsx
import { banners, collectionImages, highlightCollectionImages } from 'assets/index';
import { ThreeItemGrid } from 'components/grid/three-items';
import HeroBanner from 'components/hero';
import HighlightCollection from 'components/highlightCollection';
import Footer from 'components/layout/footer';
import ProductGroupsDisplay from 'components/product/ProductGroupsDisplay';
import ThreeImageCollections from 'components/three-collections';

export const metadata = {
   description: 'Dear John Denim, a premium denim brand that offers a wide range of denim',
   openGraph: {
      type: 'website'
   }
};
const SHOPIFY_ENDPOINT = process.env.SHOPIFY_GRAPHQL_ENDPOINT || '';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

// This tells Next.js to revalidate the page every 60 seconds.
export const revalidate = 60;

export default async function HomePage() {
   // Fetch your product groups metaobject from Shopify.

   // Fetch the metaobject
   const metaobjectQuery = `
    query GetProductGroupMetaobject($handle: MetaobjectHandleInput!) {
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
   const metaobjectVariables = {
      handle: {
         handle: 'yanis-top', // Adjust if needed
         type: 'product_groups' // Adjust if needed
      }
   };

   const metaRes = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query: metaobjectQuery, variables: metaobjectVariables })
   });
   const metaJson = await metaRes.json();
   console.log('Metaobject response:', metaJson);
   const metaobject = metaJson.data?.metaobject;

   let groupTitle = '';
   let productIds: string[] = [];
   if (metaobject) {
      const nameField = metaobject.fields.find((field: { key: string }) => field.key === 'name');
      groupTitle = nameField ? nameField.value : 'Unnamed Group';

      const groupField = metaobject.fields.find((field: { key: string }) => field.key === 'group');
      if (groupField) {
         try {
            productIds = JSON.parse(groupField.value);
         } catch (error) {
            console.error('Error parsing product IDs:', error);
         }
      }
   }
   console.log('Group Title:', groupTitle);
   console.log('Product IDs:', productIds);

   // Fetch product details
   let products: any[] = [];
   if (productIds.length > 0) {
      const productsQuery = `
      query GetProducts($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      handle
      options {
        name
        values
      }
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
      variants(first: 1) {
        edges {
          node {
            priceV2 {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
}

    `;
      const productsVariables = { ids: productIds };
      const productsRes = await fetch(SHOPIFY_ENDPOINT, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
         },
         body: JSON.stringify({ query: productsQuery, variables: productsVariables })
      });
      const productsJson = await productsRes.json();
      console.log('Products query response:', productsJson);
      products = productsJson.data?.nodes || [];
      console.log('Fetched products:', products);
   }

   return (
      <>
         <HeroBanner banners={banners} interval={1100} />
         <ThreeImageCollections collectionImages={collectionImages} />
         {/* <Carousel products={products} /> */}
         <HighlightCollection highlightCollectionImages={highlightCollectionImages} />
         <ThreeItemGrid />
         {/* Render the Product Groups section if data exists */}
         {groupTitle && products.length > 0 ? (
            <ProductGroupsDisplay groupTitle={groupTitle} products={products} />
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
