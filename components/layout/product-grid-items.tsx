import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';
import ProductGroupsDisplay from '../../components/product/ProductGroupsDisplay';

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '';
export const revalidate = 60;

export default async function ProductGridItems({ products }: { products: Product[] }) {
   // --- 1. Fetch the metaobject for the product group ---
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
         handle: 'yanis-top', // Adjust if needed.
         type: 'product_groups' // Adjust if needed.
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

   // --- 2. Fetch parent product details if product IDs exist ---
   let parentProducts: any[] = [];
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
      parentProducts = productsJson.data?.nodes || [];
   }

   // --- 3. Render product grid items and group display ---
   return (
      <>
         {products.map((product) => {
            // Attempt to extract the metaobject ID for the color swatch.
            let metaobjectId: string | null = null;
            if (product.metafields && product.metafields.length > 0) {
               // Find the metafield with key "color-pattern"
               const found = product.metafields.find((mf) => mf.key === 'color-pattern');
               if (found && found.value) {
                  try {
                     // Parse the JSON string (e.g. '["gid://shopify/Metaobject/78677147737"]')
                     const metaobjectIds = JSON.parse(found.value);
                     if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
                        metaobjectId = metaobjectIds[0]; // Use the first metaobject ID.
                     }
                  } catch (error) {
                     console.error('Error parsing metafield value:', error);
                  }
               }
            }

            return (
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
                        secondarySrc={product.images[1]?.url} // Use the second image if available.
                        fill
                        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                     />
                  </Link>
               </Grid.Item>
            );
         })}
         {groupTitle && products.length > 0 ? (
            <ProductGroupsDisplay groupTitle={groupTitle} products={products} />
         ) : (
            <p className="text-center text-gray-500">No product groups found collection page.</p>
         )}
      </>
   );
}
