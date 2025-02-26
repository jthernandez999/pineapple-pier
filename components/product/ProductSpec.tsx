'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

export function ProductSpec({ product }: { product: Product }) {
   const { state } = useProduct();
   const updateSpec = useUpdateSpec();
   const [currentSpec, setCurrentSpec] = useState<string>('');

   // Dropdown state for Materials & Care and Specifications
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
         const option = product.options.find((opt) => opt.name.toLowerCase() === 'spec');
         if (option && Array.isArray(option.values)) {
            setCurrentSpec(option.values[0] || '');
         }
      }
   }, [state, product]);

   // Use "Body Length" as a marker to separate Materials & Care from Specifications
   // if "Body Length" is not available use "Front Rise"
   const specMarker = currentSpec.includes('Body Length') ? 'Body Length' : 'Front Rise';

   const markerIndex = currentSpec.indexOf(specMarker);
   const materialsCarePart =
      markerIndex !== -1 ? currentSpec.slice(0, markerIndex).trim() : currentSpec;
   const specificationsPart = markerIndex !== -1 ? currentSpec.slice(markerIndex).trim() : '';

   // Parse Materials & Care
   const tokens = materialsCarePart.split(',').map((s) => s.trim());
   // Remove the first token if it starts with "Material:" and contains extraneous info.
   let filteredTokens = tokens;
   if (tokens[0] && tokens[0].toLowerCase().startsWith('material:')) {
      // For example, tokens[0] might be "Material: LUREX"
      // We drop it so that we start from token[1]
      filteredTokens = tokens.slice(1);
   }
   // Expected order:
   // Index 0-4: material details (5 tokens)
   // Index 5+: care details
   const materialTokens = filteredTokens.slice(0, 5);
   const careTokens = filteredTokens.slice(5);

   const materialText = materialTokens.join(', ');
   const careText = careTokens.join(', ');

   // Parse Specifications (assume comma-separated key: value pairs)
   const specPairs = specificationsPart
      ? specificationsPart
           .split(',')
           .map((s) => s.trim())
           .filter(Boolean)
      : [];

   return (
      <div className="mb-6">
         {/* <h2 className="mb-4 text-xl font-medium">Product Details</h2> */}

         {/* Materials & Care Dropdown */}
         <div className="mb-4 border-b pb-2">
            <button
               onClick={() => setMaterialsOpen(!materialsOpen)}
               className="flex w-full items-center justify-between text-left text-lg font-normal text-gray-800 hover:opacity-80"
            >
               <span>Materials &amp; Care</span>
               <svg
                  className={`h-6 w-6 transform transition-transform duration-200 ${
                     materialsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
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
               <svg
                  className={`h-6 w-6 transform transition-transform duration-200 ${
                     specsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
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
