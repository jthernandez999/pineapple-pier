'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

export function ProductSpec({ product }: { product: Product }) {
   const { state } = useProduct();
   const updateSpec = useUpdateSpec();
   const [currentSpec, setCurrentSpec] = useState<string>('');

   // Debug: log the product context state and product data
   useEffect(() => {
      console.log('Product context state:', state);
      console.log('Product data:', product);
   }, [state, product]);

   // Assume that the spec is stored in the context state under "spec"
   // Adjust the key if necessary.
   useEffect(() => {
      if (state && typeof state.spec === 'string') {
         setCurrentSpec(state.spec);
      } else {
         console.warn('No "spec" found in state, using fallback from product options.');
         // Fallback: try to derive spec from product options
         const option = product.options.find((opt) => opt.name.toLowerCase() === 'spec');
         if (option && Array.isArray(option.values)) {
            // Use the first value as a fallback
            setCurrentSpec(option.values[0] || '');
         }
      }
   }, [state, product]);

   // Optionally, provide a way to update the spec:
   const handleUpdateSpec = () => {
      // Example spec object: { spec: 'Color: Red, Size: Medium' }
      // This would update each key in the spec object via updateOption.
      // Here, we simply call updateSpec with an object that has our new spec.
      const newSpec = { spec: 'Color: Blue, Size: Large' };
      updateSpec(newSpec);
      console.log('Called updateSpec with:', newSpec);
   };

   return (
      <div className="mb-6">
         <h2 className="text-lg font-semibold">Specifications</h2>
         {currentSpec ? (
            currentSpec.split(',').map((entry, entryIndex) => {
               const parts = entry.split(':');
               if (parts.length < 2) {
                  return <p key={entryIndex}>{entry}</p>;
               }
               const [key, value] = parts.map((s) => s.trim());
               return (
                  <p key={entryIndex}>
                     <strong>{key}:</strong> {value}
                  </p>
               );
            })
         ) : (
            <p>No specifications available for this variant.</p>
         )}
      </div>
   );
}
