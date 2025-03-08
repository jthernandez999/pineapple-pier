'use client';
import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import Label from 'components/label';
import { useProductGroups } from 'components/product/ProductGroupsContext';
import {
   flattenMetafields,
   getColorPatternMetaobjectId,
   Metafield
} from 'lib/helpers/metafieldHelpers';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

// Helper to extract the parent group value.
function getParentGroup(product: Product): string {
   const fields: Metafield[] = flattenMetafields(product);
   const parentGroupField = fields.find((mf) => mf.key === 'custom.parent_groups');
   return parentGroupField ? parentGroupField.value.trim() : 'Uncategorized';
}

// Helper to extract price.
function extractPrice(product: Product): string {
   if (product.price && !isNaN(Number(product.price))) return product.price;
   if (product.variants && product.variants.length > 0 && product.variants[0]?.priceV2) {
      const amount = Number(product.variants[0].priceV2.amount);
      return isNaN(amount) ? '' : amount.toFixed(2);
   }
   return '';
}

// Helper to flatten images.
function flattenImages(images: any): any[] {
   if (!images) return [];
   if (Array.isArray(images)) return images;
   if ('edges' in images && Array.isArray(images.edges)) {
      return images.edges.map((edge: any) => edge.node);
   }
   return [];
}

interface ProductGridItemsProps {
   products: Product[];
   groupHandle?: string;
}

export function ProductGridItemsComponent({ products, groupHandle }: ProductGridItemsProps) {
   // Memoize groupsMap so it only recalculates when products change.
   const groupsMap = useMemo(() => {
      const map: { [groupKey: string]: Product[] } = {};
      products.forEach((product) => {
         const parentGroup = getParentGroup(product);
         map[parentGroup] = map[parentGroup] || [];
         map[parentGroup].push(product);
      });
      return map;
   }, [products]);

   // Use our ProductGroups context to store the groups.
   const { setGroups } = useProductGroups();
   useEffect(() => {
      setGroups(groupsMap);
   }, [groupsMap, setGroups]);

   // Build mapping for each group.
   const groupMetaobjectMapping = useMemo(() => {
      return Object.entries(groupsMap)
         .map(([groupKey, groupProducts]) => {
            if (!groupProducts || groupProducts.length === 0) return null;
            const representativeProduct = groupProducts[0]!;
            const metaobjectId = getColorPatternMetaobjectId(representativeProduct);
            const fallbackColor =
               representativeProduct.options
                  ?.find((o) => o.name.toLowerCase() === 'color')
                  ?.values[0]?.toLowerCase() || '#FFFFFF';
            return {
               group: groupKey,
               metaobjectId,
               fallbackColor,
               groupProducts
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
   }, [groupsMap]);

   // Filter out "Uncategorized" groups for interactivity.
   const interactiveGroups = useMemo(() => {
      return groupMetaobjectMapping.filter(
         (mapping) => mapping.group !== 'Uncategorized' && mapping.groupProducts.length > 0
      );
   }, [groupMetaobjectMapping]);
   console.log('interactiveGroups:::::!::!:!:!:', interactiveGroups);
   // State: active product per group.
   const [activeProducts, setActiveProducts] = useState<{ [group: string]: Product }>(() => {
      const initial: { [group: string]: Product } = {};
      interactiveGroups.forEach(({ group, groupProducts }) => {
         if (groupProducts.length > 0) {
            initial[group] = groupProducts[0]!;
         }
      });
      return initial;
   });

   return (
      <>
         {/* Render interactive group cards */}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {interactiveGroups.map(({ group, fallbackColor, groupProducts, metaobjectId }) => {
               const activeProduct = activeProducts[group] || groupProducts[0]!;
               const parentPrice = extractPrice(activeProduct);

               // Compute unique metaobject IDs (colors) for the group.
               const groupColorMetaobjectIds = Array.from(
                  new Set(
                     groupProducts
                        .map((product) => getColorPatternMetaobjectId(product))
                        .filter((id): id is string => Boolean(id))
                  )
               );
               console.log(
                  'Group color metaobject IDs from PRODUCT GRID ITEMS:',
                  groupColorMetaobjectIds
               );
               // onSwatchClick handler: update active product only if a different swatch is clicked.
               const handleSwatchSelect = (
                  swatchId: string,
                  e: React.MouseEvent<HTMLDivElement>
               ) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const currentActiveId = (
                     getColorPatternMetaobjectId(activeProduct) || metaobjectId
                  )
                     ?.toLowerCase()
                     .trim();
                  const clickedId = swatchId.toLowerCase().trim();
                  if (clickedId === currentActiveId) return;
                  const nextProduct = groupProducts.find(
                     (product) =>
                        (getColorPatternMetaobjectId(product) || '').toLowerCase().trim() ===
                        clickedId
                  );
                  if (nextProduct) {
                     setActiveProducts((prev) => ({
                        ...prev,
                        [group]: nextProduct
                     }));
                  }
               };

               return (
                  <Grid.Item key={group} className="animate-fadeIn">
                     <Link
                        href={`/product/${activeProduct.handle}`}
                        prefetch={true}
                        className="flex h-full w-full flex-col"
                     >
                        <div className="relative aspect-[2/3] w-full">
                           <GridTileImage
                              alt={activeProduct.title}
                              src={activeProduct.featuredImage?.url}
                              secondarySrc={
                                 activeProduct.images && activeProduct.images[1]?.url
                                    ? activeProduct.images[1]?.url
                                    : activeProduct.featuredImage?.url
                              }
                              fill
                              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                              swatchMetaobjectId={
                                 getColorPatternMetaobjectId(activeProduct) || metaobjectId
                              }
                              swatchFallbackColor={fallbackColor}
                           />
                        </div>
                        <div className="mt-0">
                           <Label
                              title={activeProduct.title}
                              amount={
                                 activeProduct.priceRange?.maxVariantPrice?.amount ?? parentPrice
                              }
                              currencyCode={
                                 activeProduct.priceRange?.maxVariantPrice?.currencyCode ?? ''
                              }
                              colorName={
                                 activeProduct.options?.find(
                                    (o) => o.name.toLowerCase() === 'color'
                                 )?.values[0]
                              }
                              metaobjectId={
                                 getColorPatternMetaobjectId(activeProduct) || metaobjectId
                              }
                              fallbackColor={
                                 activeProduct.options
                                    ?.find((o) => o.name.toLowerCase() === 'color')
                                    ?.values[0]?.toLowerCase() || '#FFFFFF'
                              }
                              position="bottom"
                              metaobjectIdsArray={groupColorMetaobjectIds}
                              onSwatchClick={handleSwatchSelect}
                           />
                        </div>
                     </Link>
                  </Grid.Item>
               );
            })}
         </div>

         {/* Render individual product cards */}
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
