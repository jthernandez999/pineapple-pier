// components/ProductGroupsByParent.tsx
'use client';

import { flattenMetafields, Metafield } from 'lib/helpers/metafieldHelpers';
import { ParentProduct } from 'lib/shopify/types';
import React from 'react';
import ProductGroupsDisplay from '../components/product/ProductGroupsDisplay';

// Helper to extract the parent group value from a product’s metafields.
function getParentGroup(product: ParentProduct): string {
   const fields: Metafield[] = flattenMetafields(product);
   // Look for the custom parent groups field that we aliased as "parentGroups"
   const parentGroupField = fields.find((mf) => mf.key === 'custom.parent_groups');
   return parentGroupField ? parentGroupField.value : 'Uncategorized';
}

// Group products by the parent group value.
function groupProductsByParent(products: ParentProduct[]): Record<string, ParentProduct[]> {
   return products.reduce(
      (groups, product) => {
         const groupLabel = getParentGroup(product).trim();
         if (!groups[groupLabel]) {
            groups[groupLabel] = [];
         }
         groups[groupLabel].push(product);
         return groups;
      },
      {} as Record<string, ParentProduct[]>
   );
}

interface ProductGroupsByParentProps {
   products: ParentProduct[];
}

const ProductGroupsByParent: React.FC<ProductGroupsByParentProps> = ({ products }) => {
   const groups = groupProductsByParent(products);
   console.log('Grouped Products by Parent:', groups);
   return (
      <div>
         {Object.entries(groups).map(([groupTitle, groupProducts]) => (
            <ProductGroupsDisplay
               key={groupTitle}
               groupTitle={groupTitle}
               products={groupProducts}
            />
         ))}
      </div>
   );
};

export default ProductGroupsByParent;
