// components/ProductGroupsDisplay.tsx
import Image from 'next/image';
import React from 'react';
import { ProductGroup } from '../../lib/shopify/types';

type ProductGroupsDisplayProps = {
   groups: ProductGroup[];
};

const ProductGroupsDisplay: React.FC<ProductGroupsDisplayProps> = ({ groups }) => {
   return (
      <div className="space-y-12">
         {groups.map((group) => (
            <section key={group.id}>
               <h3 className="mb-4 text-2xl font-bold">{group.title}</h3>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {group.products.map(
                     (product) => (
                        console.log('PRODUCT FROM PRODUCT GROUP', product),
                        (
                           <div key={product.id}>
                              <Image
                                 className="h-48 w-full object-cover"
                                 src={product.images[0]?.url as string}
                                 alt={product.images[0]?.altText as string}
                              />
                              <h4 className="mt-2 text-lg font-semibold">{product.title}</h4>
                              <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                           </div>
                        )
                     )
                  )}
               </div>
            </section>
         ))}
      </div>
   );
};

export default ProductGroupsDisplay;
