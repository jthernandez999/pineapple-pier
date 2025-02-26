'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

export function ProductSpec({ product }: { product: Product }) {
   const { state } = useProduct();
   const updateSpec = useUpdateSpec();
   const [currentSpec, setCurrentSpec] = useState<string>('');

   // Dropdown states for Materials & Care and Specifications
   const [materialsOpen, setMaterialsOpen] = useState<boolean>(false);
   const [specsOpen, setSpecsOpen] = useState<boolean>(false);

   useEffect(() => {
      console.log('Product context state:', state);
      console.log('Product data:', product);
   }, [state, product]);

   useEffect(() => {
      if (state && typeof state.spec === 'string' && state.spec.trim() !== '') {
         setCurrentSpec(state.spec);
      } else {
         console.warn('No "spec" found in state, using fallback from product options.');
         const option = product?.options?.find((opt) => opt.name.toLowerCase() === 'spec');
         if (option && Array.isArray(option.values)) {
            setCurrentSpec(option.values[0] || '');
         }
      }
   }, [state, product]);

   // Determine spec marker: use "Body Length" if available; otherwise, "Front Rise"
   const specMarker = currentSpec.includes('Body Length') ? 'Body Length' : 'Front Rise';
   const markerIndex = currentSpec.indexOf(specMarker);
   const materialsCarePart =
      markerIndex !== -1 ? currentSpec.slice(0, markerIndex).trim() : currentSpec;
   const specificationsPart = markerIndex !== -1 ? currentSpec.slice(markerIndex).trim() : '';

   // Process Materials & Care section
   // Remove a leading "Material:" if present.
   let rawMaterials = materialsCarePart.replace(/^Material:\s*/i, '').trim();

   let materialText = '';
   let careText = '';

   // If the string contains "Care:" explicitly, split on that.
   if (/care:/i.test(rawMaterials)) {
      const parts = rawMaterials.split(/care:/i);
      materialText = parts[0]?.trim() || '';
      careText = parts[1]?.trim() || '';
   } else {
      // Otherwise, split by commas.
      const tokens = rawMaterials.split(',').map((s) => s.trim());
      // Separate tokens that seem to be material composition (containing '%' or starting with a digit)
      const materialTokens = tokens.filter((token) => /[%\d]/.test(token.charAt(0)));
      const nonMaterialTokens = tokens.filter((token) => !/%/.test(token) && !/^\d/.test(token));
      // If materialTokens exist, use them as material; otherwise, assume the whole string is care.
      if (materialTokens.length > 0) {
         materialText = materialTokens.join(', ');
         careText = nonMaterialTokens.join(', ');
      } else {
         careText = rawMaterials;
      }
   }

   // Process Specifications section: split into comma-separated key-value pairs
   const specPairs = specificationsPart
      ? specificationsPart
           .split(',')
           .map((s) => s.trim())
           .filter(Boolean)
      : [];

   return (
      <div className="mb-6">
         {/* Materials & Care Dropdown */}
         <div className="mb-4 border-b pb-2">
            <button
               onClick={() => setMaterialsOpen(!materialsOpen)}
               className="flex w-full items-center justify-between text-left text-lg font-normal text-gray-800 hover:opacity-80"
            >
               <span>Materials &amp; Care</span>
               {materialsOpen ? (
                  // Minus icon for open state
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                     />
                  </svg>
               ) : (
                  // Plus icon for closed state
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                     />
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                     />
                  </svg>
               )}
            </button>
            {materialsOpen && (
               <div className="mt-2 pl-4 text-gray-700">
                  {materialText && (
                     <p>
                        <strong>Material:</strong> {materialText}
                     </p>
                  )}
                  {careText && (
                     <p>
                        <strong>Care:</strong> {careText}
                     </p>
                  )}
               </div>
            )}
         </div>

         {/* Specifications Dropdown */}
         <div className="mb-4 border-b pb-2">
            <button
               onClick={() => setSpecsOpen(!specsOpen)}
               className="flex w-full items-center justify-between text-left text-lg font-normal text-gray-800 hover:opacity-80"
            >
               <span>Specifications</span>
               {specsOpen ? (
                  // Minus icon for open state
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                     />
                  </svg>
               ) : (
                  // Plus icon for closed state
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                     />
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                     />
                  </svg>
               )}
            </button>
            {specsOpen && (
               <div className="mt-2 pl-4 text-gray-700">
                  {specPairs.length > 0 ? (
                     specPairs.map((pair, index) => {
                        const [key, value] = pair.split(':').map((s) => s.trim());
                        return (
                           <p key={index}>
                              <strong>{key}:</strong> {value}
                           </p>
                        );
                     })
                  ) : (
                     <p>No specifications available.</p>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
