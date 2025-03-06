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
   // Group products by their parent group.
   const groupsMap: { [groupKey: string]: Product[] } = {};
   products.forEach((product) => {
      const parentGroup = getParentGroup(product);
      groupsMap[parentGroup] = groupsMap[parentGroup] || [];
      groupsMap[parentGroup].push(product);
   });
   console.log('groupsMap::::::::::::::::::::::::', groupsMap);

   // Create a mapping for each group containing the metaobjectId for the "color-pattern"
   // and a fallback color.
   const groupMetaobjectMapping = Object.entries(groupsMap)
      .map(([groupKey, groupProducts]) => {
         if (!groupProducts || groupProducts.length === 0) return null;
         const representativeProduct = groupProducts[0];
         if (!representativeProduct) return null;
         const metaobjectId = getColorPatternMetaobjectId(representativeProduct);
         const fallbackColor =
            representativeProduct.options
               ?.find((o) => o.name.toLowerCase() === 'color')
               ?.values[0]?.toLowerCase() || '#FFFFFF';
         return {
            group: groupKey,
            metaobjectId,
            fallbackColor,
            groupProducts // Save groupProducts for later use.
         };
      })
      .filter(
         (
            mapping
         ): mapping is {
            group: string;
            metaobjectId: string | undefined;
            fallbackColor: string;
            groupProducts: Product[];
         } => mapping !== null
      );
   // Extract metaobjectIds for the entire grid (filtering out undefined ones).
   const metaobjectIdsArray = groupMetaobjectMapping
      .map((mapping) => mapping.metaobjectId)
      .filter((id): id is string => id !== undefined);

   console.log('metaobjectIdsArray::::::::::::::::::::::::', metaobjectIdsArray);

   // Helper to flatten images.
   function flattenImages(images: any): any[] {
      if (!images) return [];
      if (Array.isArray(images)) return images;
      if (images.edges) {
         return images.edges.map((edge: any) => edge.node);
      }
      return [];
   }

   return (
      <>
         {/* Render parent group cards (excluding "Uncategorized") */}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {groupMetaobjectMapping
               .filter(
                  (mapping) => mapping.group !== 'Uncategorized' && mapping.groupProducts.length > 0
               )
               .map(({ group, metaobjectId, fallbackColor, groupProducts }) => {
                  // Safely grab the representative product.
                  const representativeProduct = groupProducts[0]!;
                  const parentPrice = extractPrice(representativeProduct);
                  return (
                     <Grid.Item key={group} className="animate-fadeIn">
                        <Link
                           href={`/product/${representativeProduct.handle}`}
                           prefetch={true}
                           className="flex h-full w-full flex-col"
                        >
                           <div className="relative aspect-[2/3] w-full">
                              <GridTileImage
                                 alt={representativeProduct.title}
                                 src={representativeProduct.featuredImage?.url}
                                 secondarySrc={
                                    representativeProduct.images &&
                                    representativeProduct.images[1]?.url
                                       ? representativeProduct.images[1]?.url
                                       : representativeProduct.featuredImage?.url
                                 }
                                 fill
                                 sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                                 swatchMetaobjectId={metaobjectId}
                                 swatchFallbackColor={fallbackColor}
                              />
                           </div>
                           <div className="mt-0">
                              <Label
                                 title={representativeProduct.title}
                                 amount={
                                    representativeProduct.priceRange?.maxVariantPrice?.amount ??
                                    parentPrice
                                 }
                                 currencyCode={
                                    representativeProduct.priceRange?.maxVariantPrice
                                       ?.currencyCode ?? ''
                                 }
                                 colorName={
                                    representativeProduct.options?.find(
                                       (o) => o.name.toLowerCase() === 'color'
                                    )?.values[0]
                                 }
                                 metaobjectId={metaobjectId}
                                 // Pass only the current group's metaobjectId as an array:
                                 metaobjectIdsArray={metaobjectIdsArray}
                                 fallbackColor={
                                    representativeProduct.options
                                       ?.find((o) => o.name.toLowerCase() === 'color')
                                       ?.values[0]?.toLowerCase() || '#FFFFFF'
                                 }
                                 position="bottom"
                              />
                           </div>
                        </Link>
                     </Grid.Item>
                  );
               })}
         </div>

         {/* Render the standard grid of individual products */}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {products.map((product) => {
               const flattenedImages = flattenImages(product.images);
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
                              secondarySrc={flattenedImages[1]?.url || product.featuredImage?.url}
                              fill
                              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                              swatchMetaobjectId={getColorPatternMetaobjectId(product)}
                              swatchFallbackColor={
                                 product.options
                                    ?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]?.toLowerCase() || '#FFFFFF'
                              }
                           />
                        </div>
                        <div className="mt-0">
                           <Label
                              title={product.title}
                              amount={product.priceRange?.maxVariantPrice?.amount ?? ''}
                              currencyCode={product.priceRange?.maxVariantPrice?.currencyCode ?? ''}
                              colorName={
                                 product.options?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]
                              }
                              metaobjectId={getColorPatternMetaobjectId(product)}
                              fallbackColor={
                                 product.options
                                    ?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]?.toLowerCase() || '#FFFFFF'
                              }
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
