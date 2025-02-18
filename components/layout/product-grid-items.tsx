'use client';
import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import { getSwatchMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ProductGroupsDisplay from '../../components/product/ProductGroupsDisplay';

interface ProductGridItemsProps {
   products: Product[];
   groupHandle?: string;
}

function ProductGridItemsComponent({ products, groupHandle }: ProductGridItemsProps) {
   const [metaobjectResults, setMetaobjectResults] = useState<any[]>([]);
   const groupsMap: { [groupKey: string]: Product[] } = {};

   // Group products by their swatch metafield.
   products.forEach((product) => {
      const metaobjectId = getSwatchMetaobjectId(product);
      if (metaobjectId) {
         if (!groupsMap[metaobjectId]) {
            groupsMap[metaobjectId] = [];
         }
         groupsMap[metaobjectId].push(product);
      }
   });

   // Fetch metaobject details for each group only once.
   useEffect(() => {
      async function fetchMetaobjects() {
         const groupKeys = Object.keys(groupsMap);
         const queries = groupKeys.map(async (groupKey) => {
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
            const variables = { handle: { handle: groupKey, type: 'product_groups' } };
            const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token':
                     process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
               },
               body: JSON.stringify({ query: metaobjectQuery, variables })
            });
            const json = await res.json();
            return { groupKey, metaobject: json.data?.metaobject };
         });
         const results = await Promise.all(queries);
         setMetaobjectResults(results.filter((r) => r.metaobject !== null));
      }
      fetchMetaobjects();
   }, [products]); // Depend on products if groupsMap may change

   return (
      <>
         {metaobjectResults.length > 0 &&
            metaobjectResults.map(({ groupKey, metaobject }) => {
               const nameField = metaobject.fields.find((f: any) => f.key === 'name');
               const groupTitleFromMeta = nameField ? nameField.value : groupKey;
               const groupProducts: Product[] = groupsMap[groupKey] || [];
               return (
                  <ProductGroupsDisplay
                     key={groupKey}
                     groupTitle={groupTitleFromMeta}
                     products={groupProducts}
                  />
               );
            })}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {products.map((product) => (
               <Grid.Item key={product.handle} className="aspect-[2/3] animate-fadeIn">
                  <Link
                     href={`/product/${product.handle}`}
                     prefetch={true}
                     className="relative inline-block h-full w-full"
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
                        swatchMetaobjectId={getSwatchMetaobjectId(product)}
                        swatchFallbackColor={product.options
                           ?.find((o) => o.name.toLowerCase() === 'color')
                           ?.values[0]?.toLowerCase()}
                     />
                  </Link>
               </Grid.Item>
            ))}
         </div>
      </>
   );
}

export const ProductGridItems = React.memo(ProductGridItemsComponent);
