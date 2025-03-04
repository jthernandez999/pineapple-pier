'use client';
import ProductGroupsDisplay from 'components/product/ProductGroupsDisplay';
import { getProductGroupMetaobjectData } from 'lib/helpers/metafieldHelpers';
import { Product } from 'lib/shopify/types';
import React, { useEffect, useState } from 'react';

interface Group {
   metaobjectData: { id: string; label: string };
   products: Product[];
}

interface ProductGroupsProps {
   products: Product[];
}

const ProductGroups: React.FC<ProductGroupsProps> = ({ products }) => {
   console.log('ProductGroups component mounted with products:', products);
   const [groupsMap, setGroupsMap] = useState<{ [key: string]: Group }>({});

   useEffect(() => {
      async function groupProducts() {
         const map: { [key: string]: Group } = {};
         // Iterate over all products to group by product group metaobject.
         for (const product of products) {
            // Use the helper to get the product group metaobject data.
            const metaData = await getProductGroupMetaobjectData(product);
            if (metaData && metaData.id) {
               if (!map[metaData.id]) {
                  map[metaData.id] = { metaobjectData: metaData, products: [] };
               }
               map[metaData.id]?.products.push(product);
            } else {
               console.log(`Product ${product.handle} has no parent product group metaobject.`);
            }
         }
         console.log('Grouped products (parent grouping):', map);
         setGroupsMap(map);
      }
      groupProducts();
   }, [products]);

   return (
      <>
         {Object.keys(groupsMap).length === 0 && <p>No grouped parent products found.</p>}
         {Object.keys(groupsMap).map((groupKey) => {
            const group = groupsMap[groupKey]!;
            const groupTitle = group.metaobjectData.label || groupKey;
            return (
               <ProductGroupsDisplay
                  key={groupKey}
                  groupTitle={groupTitle}
                  products={group.products}
               />
            );
         })}
      </>
   );
};

export default ProductGroups;
