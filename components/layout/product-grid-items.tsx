'use client';
import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import Label from 'components/label';
import {
   flattenMetafields,
   getColorPatternMetaobjectId,
   Metafield
} from 'lib/helpers/metafieldHelpers';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';
import React from 'react';

// Helper to extract the parent group value from a product’s metafields.
// cSpell:ignore Uncategorized
function getParentGroup(product: Product): string {
   const fields: Metafield[] = flattenMetafields(product);
   const parentGroupField = fields.find((mf) => mf.key === 'custom.parent_groups');
   return parentGroupField ? parentGroupField.value.trim() : 'Uncategorized';
}

// Helper to extract price (adjust as needed)
function extractPrice(product: Product): string {
   if (product.price && !isNaN(Number(product.price))) return product.price;
   if (product.variants && product.variants.length > 0 && product.variants[0]?.priceV2) {
      const amount = Number(product.variants[0].priceV2.amount);
      return isNaN(amount) ? '' : amount.toFixed(2);
   }
   return '';
}

interface ProductGridItemsProps {
   products: Product[];
   groupHandle?: string;
}

function ProductGridItemsComponent({ products, groupHandle }: ProductGridItemsProps) {
   const groupsMap: { [groupKey: string]: Product[] } = {};

   // Group products by their parent group value.
   products.forEach((product) => {
      const parentGroup = getParentGroup(product);
      groupsMap[parentGroup] = groupsMap[parentGroup] || [];
      groupsMap[parentGroup].push(product);
   });
   console.log('groupsMap::::::::::::::::::::::::', groupsMap);

   return (
      <>
         {/* Render parent group cards, excluding "Uncategorized" and empty groups */}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {Object.entries(groupsMap)
               .filter(
                  ([groupKey, groupProducts]) =>
                     groupKey !== 'Uncategorized' && groupProducts.length > 0
               )
               .map(([groupKey, groupProducts]) => {
                  // Now it's safe to assert that groupProducts[0] exists.
                  const parentProduct = groupProducts[0]!;
                  const parentPrice = extractPrice(parentProduct);
                  return (
                     <Grid.Item key={groupKey} className="animate-fadeIn">
                        <Link
                           href={`/product/${parentProduct.handle}`}
                           prefetch={true}
                           className="flex h-full w-full flex-col"
                        >
                           <div className="relative aspect-[2/3] w-full">
                              <GridTileImage
                                 alt={parentProduct.title}
                                 src={parentProduct.featuredImage?.url}
                                 secondarySrc={
                                    parentProduct.images && parentProduct.images[1]?.url
                                       ? parentProduct.images[1].url
                                       : parentProduct.featuredImage?.url
                                 }
                                 fill
                                 sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                                 swatchMetaobjectId={getColorPatternMetaobjectId(parentProduct)}
                                 swatchFallbackColor={parentProduct.options
                                    ?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]?.toLowerCase()}
                              />
                           </div>
                           <div className="mt-0">
                              <Label
                                 title={parentProduct.title}
                                 amount={parentPrice}
                                 currencyCode={
                                    parentProduct.priceRange.maxVariantPrice.currencyCode
                                 }
                                 colorName={
                                    parentProduct.options?.find(
                                       (o) => o.name.toLowerCase() === 'color'
                                    )?.values[0]
                                 }
                                 metaobjectId={getColorPatternMetaobjectId(parentProduct)}
                                 fallbackColor={parentProduct.options
                                    ?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]?.toLowerCase()}
                                 position="bottom"
                              />
                           </div>
                        </Link>
                     </Grid.Item>
                  );
               })}
         </div>

         {/* Render the standard grid of all products */}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {products.map((product) => {
               return (
                  <Grid.Item key={product.handle} className="animate-fadeIn">
                     <Link
                        href={`/product/${product.handle}`}
                        prefetch={true}
                        className="flex h-full w-full flex-col"
                     >
                        <div className="relative aspect-[2/3] w-full">
                           <GridTileImage
                              alt={product.title}
                              src={product.featuredImage?.url}
                              secondarySrc={
                                 product.images && product.images[1]?.url
                                    ? product.images[1].url
                                    : product.featuredImage?.url
                              }
                              fill
                              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                              swatchMetaobjectId={getColorPatternMetaobjectId(product)}
                              swatchFallbackColor={product.options
                                 ?.find((o) => o.name.toLowerCase() === 'color')
                                 ?.values[0]?.toLowerCase()}
                           />
                        </div>
                        <div className="mt-0">
                           <Label
                              title={product.title}
                              amount={product.priceRange.maxVariantPrice.amount}
                              currencyCode={product.priceRange.maxVariantPrice.currencyCode}
                              colorName={
                                 product.options?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]
                              }
                              metaobjectId={getColorPatternMetaobjectId(product)}
                              fallbackColor={product.options
                                 ?.find((o) => o.name.toLowerCase() === 'color')
                                 ?.values[0]?.toLowerCase()}
                              position="bottom"
                           />
                        </div>
                     </Link>
                  </Grid.Item>
               );
            })}
         </div>
      </>
   );
}

export const ProductGridItems = React.memo(ProductGridItemsComponent);
