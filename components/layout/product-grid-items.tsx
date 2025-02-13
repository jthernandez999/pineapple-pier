import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import { dynamicMetaobjectId, getSwatchMetaobjectId } from 'lib/helpers/metafieldHelpers';
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
   console.log('[ProductGridItems] Initial products count:', products.length);
   // --- 1. Group products by their metaobject reference (metafield "color-pattern") ---
   const groupsMap: { [groupKey: string]: Product[] } = {};
   for (const product of products) {
      console.log(`[ProductGridItems] ${product.handle} METAFIELDS:`, product.metafields);
      // Use the helper to extract the metaobject ID for grouping.
      const metaobjectId = getSwatchMetaobjectId(product);
      console.log(`[ProductGridItems] ${product.handle} metaobjectId:`, metaobjectId);
      if (metaobjectId) {
         // In this case, we assume the metafield value (a JSON array) stores the group handle as the first element.
         const groupKey = metaobjectId;
         if (!groupsMap[groupKey]) {
            groupsMap[groupKey] = [];
         }
         groupsMap[groupKey].push(product);
      }
   }

   console.log('[ProductGridItems] Grouped products map:', groupsMap);

   // --- 2. Fetch metaobject details for each group ---
   const groupKeys = Object.keys(groupsMap);
   console.log('[ProductGridItems] Group keys to fetch:', groupKeys);
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
      console.log(`[ProductGridItems] Fetching metaobject for groupKey: ${groupKey}`);
      const res = await fetch(SHOPIFY_ENDPOINT, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
         },
         body: JSON.stringify({ query: metaobjectQuery, variables: metaobjectVariables })
      });
      const json = await res.json();
      console.log(`[ProductGridItems] Metaobject response for groupKey ${groupKey}:`, json);
      return { groupKey, metaobject: json.data?.metaobject };
   });

   const metaobjectResults = await Promise.all(metaobjectQueries);
   console.log('[ProductGridItems] All metaobject results:', metaobjectResults);
   // Only keep groups for which Shopify returned a valid metaobject.
   const validGroups = metaobjectResults.filter((r) => r.metaobject !== null);
   console.log('[ProductGridItems] Valid groups:', validGroups);

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
               secondarySrc={product.images[1]?.url}
               fill
               sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
               // swatchMetaobjectId={getSwatchMetaobjectId(product)}
               // swatchFallbackColor={product.options
               //    ?.find((o) => o.name.toLowerCase() === 'color')
               //    ?.values[0]?.toLowerCase()}
               swatchMetaobjectId={dynamicMetaobjectId(product)}
               swatchFallbackColor={product.options
                  ?.find((o) => o.name.toLowerCase() === 'color')
                  ?.values[0]?.toLowerCase()}
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
               // Retrieve the child products for this group.
               const groupProducts: Product[] = groupsMap[groupKey] || [];
               console.log(
                  `[ProductGridItems] Rendering ProductGroupsDisplay for group ${groupKey} with ${groupProducts.length} products`
               );
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
