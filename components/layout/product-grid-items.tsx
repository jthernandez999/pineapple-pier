import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';
import ProductGroupsDisplay from '../../components/product/ProductGroupsDisplay';

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '';
export const revalidate = 60;

export default async function ProductGridItems({
   products,
   groupHandle
}: {
   products: Product[];
   groupHandle?: string;
}) {
   // --- 1. Group products by their metaobject reference (metafield "color-pattern") ---
   const groupsMap: { [groupKey: string]: Product[] } = {};

   for (const product of products) {
      if (product.metafields && product.metafields.length > 0) {
         const found = product.metafields.find((mf) => mf.key === 'color-pattern');
         if (found && found.value) {
            try {
               const groupHandles: string[] = JSON.parse(found.value);
               // Ensure the first element exists before using it as a key.
               if (Array.isArray(groupHandles) && groupHandles.length > 0 && groupHandles[0]) {
                  const groupKey = groupHandles[0];
                  if (!groupsMap[groupKey]) {
                     groupsMap[groupKey] = [];
                  }
                  groupsMap[groupKey].push(product);
               }
            } catch (error) {
               console.error('Error parsing metafield value:', error);
            }
         }
      }
   }

   // --- 2. Fetch metaobject details for each group ---
   const groupKeys = Object.keys(groupsMap);
   const metaobjectQueries = groupKeys.map(async (groupKey) => {
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
            handle: groupKey,
            type: 'product_groups'
         }
      };
      const res = await fetch(SHOPIFY_ENDPOINT, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
         },
         body: JSON.stringify({ query: metaobjectQuery, variables: metaobjectVariables })
      });
      const json = await res.json();
      return { groupKey, metaobject: json.data?.metaobject };
   });

   const metaobjectResults = await Promise.all(metaobjectQueries);
   // Only keep groups for which Shopify returned a valid metaobject.
   const validGroups = metaobjectResults.filter((r) => r.metaobject !== null);
   function isImageConnection(images: any): images is { edges: Array<{ node: any }> } {
      return images && typeof images === 'object' && 'edges' in images;
   }

   // --- 3. Create grid items for all products ---
   const gridItems = products.map((product) => (
      <Grid.Item key={product.handle} className="animate-fadeIn">
         <Link
            className="relative inline-block h-full w-full"
            href={`/product/${product.handle}`}
            prefetch={true}
         >
            <GridTileImage
               alt={product.title}
               label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
               }}
               src={product.featuredImage?.url}
               // secondarySrc={product.images[1]?.url}
               // secondarySrc={
               //    product.images.edges ? product.images.edges[1]?.node.url : product.images[1]?.url
               // }
               secondarySrc={
                  isImageConnection(product.images)
                     ? product.images.edges[1]?.node.url
                     : product.images[1]?.url
               }
               fill
               sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
         </Link>
      </Grid.Item>
   ));

   // --- 4. Render the parent groups at the top, then all product grid items ---
   return (
      <>
         {/* Render parent group displays at the top */}
         {validGroups.length > 0 &&
            validGroups.map(({ groupKey, metaobject }) => {
               // Extract the group title (e.g., field with key "name")
               const nameField = metaobject.fields.find((f: any) => f.key === 'name');
               const groupTitleFromMeta = nameField ? nameField.value : groupKey;
               // Retrieve the child products for this group
               const groupProducts: Product[] = groupsMap[groupKey] || [];
               return (
                  <ProductGroupsDisplay
                     key={groupKey}
                     groupTitle={groupTitleFromMeta}
                     products={groupProducts}
                  />
               );
            })}

         {/* Then render the full product grid */}
         {gridItems}
      </>
   );
}

// import Grid from 'components/grid';
// import { GridTileImage } from 'components/grid/tile';
// import { Product } from 'lib/shopify/types';
// import Link from 'next/link';
// import ProductGroupsDisplay from '../../components/product/ProductGroupsDisplay';

// const SHOPIFY_ENDPOINT = process.env.SHOPIFY_GRAPHQL_ENDPOINT || '';
// const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
// export const revalidate = 60;

// export default async function ProductGridItems({
//    products,
//    groupHandle
// }: {
//    products: Product[];
//    groupHandle?: string;
// }) {
//    // --- 1. Render product grid items (all products) ---
//    const gridItems = products.map((product) => (
//       <Grid.Item key={product.handle} className="animate-fadeIn">
//          <Link
//             className="relative inline-block h-full w-full"
//             href={`/product/${product.handle}`}
//             prefetch={true}
//          >
//             <GridTileImage
//                alt={product.title}
//                label={{
//                   title: product.title,
//                   amount: product.priceRange.maxVariantPrice.amount,
//                   currencyCode: product.priceRange.maxVariantPrice.currencyCode
//                }}
//                src={product.featuredImage?.url}
//                secondarySrc={product.images[1]?.url}
//                fill
//                sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
//             />
//          </Link>
//       </Grid.Item>
//    ));

//    // --- 2. Group products by their metaobject reference (metafield "color-pattern") ---
//    const groupsMap: { [groupKey: string]: Product[] } = {};

//    for (const product of products) {
//       if (product.metafields && product.metafields.length > 0) {
//          const found = product.metafields.find((mf) => mf.key === 'color-pattern');
//          if (found && found.value) {
//             try {
//                const groupHandles: string[] = JSON.parse(found.value);
//                // Ensure that the first element exists before using it as a key.
//                if (Array.isArray(groupHandles) && groupHandles.length > 0 && groupHandles[0]) {
//                   const groupKey = groupHandles[0];
//                   if (!groupsMap[groupKey]) {
//                      groupsMap[groupKey] = [];
//                   }
//                   groupsMap[groupKey].push(product);
//                }
//             } catch (error) {
//                console.error('Error parsing metafield value:', error);
//             }
//          }
//       }
//    }

//    // --- 3. Fetch metaobject details for each group ---
//    const groupKeys = Object.keys(groupsMap);
//    const metaobjectQueries = groupKeys.map(async (groupKey) => {
//       const metaobjectQuery = `
//       query GetProductGroupMetaobject($handle: MetaobjectHandleInput!) {
//         metaobject(handle: $handle) {
//           id
//           handle
//           fields {
//             key
//             value
//           }
//         }
//       }
//     `;
//       const metaobjectVariables = {
//          handle: {
//             handle: groupKey,
//             type: 'product_groups'
//          }
//       };
//       console.log('Fetching metaobject for group:', groupKey);
//       const res = await fetch(SHOPIFY_ENDPOINT, {
//          method: 'POST',
//          headers: {
//             'Content-Type': 'application/json',
//             'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
//          },
//          body: JSON.stringify({ query: metaobjectQuery, variables: metaobjectVariables })
//       });
//       const json = await res.json();
//       return { groupKey, metaobject: json.data?.metaobject };
//    });

//    const metaobjectResults = await Promise.all(metaobjectQueries);
//    // Only keep groups for which Shopify returned a valid metaobject.
//    const validGroups = metaobjectResults.filter((r) => r.metaobject !== null);

//    // --- 4. Render the full component ---
//    return (
//       <>
//          {validGroups.length > 0 &&
//             validGroups.map(({ groupKey, metaobject }) => {
//                // Extract the group title (for example, by finding the field with key "name")
//                const nameField = metaobject.fields.find((f: any) => f.key === 'name');
//                const groupTitleFromMeta = nameField ? nameField.value : groupKey;
//                // Get the group products (defaulting to an empty array if not defined)
//                const groupProducts: Product[] = groupsMap[groupKey] || [];
//                return (
//                   <ProductGroupsDisplay
//                      key={groupKey}
//                      groupTitle={groupTitleFromMeta}
//                      products={groupProducts}
//                   />
//                );
//             })}
//          {gridItems}
//       </>
//    );
// }
