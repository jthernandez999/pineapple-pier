'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

// Custom parser to split on commas not inside parentheses.
function splitSpecs(specs: string): string[] {
   const result: string[] = [];
   let current = '';
   let level = 0;
   for (let i = 0; i < specs.length; i++) {
      const char = specs[i];
      if (char === '(') {
         level++;
      } else if (char === ')') {
         level--;
      }
      if (char === ',' && level === 0) {
         result.push(current.trim());
         current = '';
      } else {
         current += char;
      }
   }
   if (current.trim() !== '') {
      result.push(current.trim());
   }
   return result;
}

export function ProductSpec({ product }: { product: Product }) {
   const { state } = useProduct();
   const updateSpec = useUpdateSpec();
   // Initialize currentSpec with a default of "n/a"
   const [currentSpec, setCurrentSpec] = useState<string>('n/a');

   // Dropdown states for Materials & Care and Specifications
   const [materialsOpen, setMaterialsOpen] = useState<boolean>(false);
   const [specsOpen, setSpecsOpen] = useState<boolean>(false);

   useEffect(() => {
      if (state && typeof state.spec === 'string' && state.spec.trim() !== '') {
         setCurrentSpec(state.spec);
      } else {
         console.warn('No "spec" found in state, using fallback from product options.');
         // Ensure we always have a string by defaulting to "n/a"
         const fallbackSpec: string =
            product?.options?.find((opt) => opt.name.toLowerCase() === 'spec')?.values?.[0] ??
            'n/a';
         setCurrentSpec(fallbackSpec);
      }
   }, [state, product]);

   // Always work with a defined string by defaulting to "n/a"
   let safeSpec = (currentSpec ?? 'n/a').trim();
   const materialPrefix = 'Material:';
   if (safeSpec.startsWith(materialPrefix)) {
      safeSpec = safeSpec.slice(materialPrefix.length).trim();
   }
   // Remove any trailing comma.
   safeSpec = safeSpec.replace(/,\s*$/, '');

   // Use our custom parser to split the safeSpec into tokens.
   const tokens = splitSpecs(safeSpec);
   // For debugging:
   // console.log('Tokens:', tokens);

   let materialText = '';
   let careText = '';
   let specTokens: string[] = [];

   if (tokens.length > 0) {
      // The first token is always the material.
      materialText = tokens[0] || 'n/a';
      // Then, iterate over the remaining tokens:
      // - As long as we haven't seen a token containing a colon, consider them part of the care instructions.
      // - Once a token includes a colon, treat that and all subsequent tokens as specification pairs.
      const careTokens: string[] = [];
      let specsStarted = false;
      for (let i = 1; i < tokens.length; i++) {
         const token = tokens[i] ?? '';
         if (!specsStarted && token.includes(':')) {
            specsStarted = true;
            specTokens.push(token);
         } else if (!specsStarted && !token.includes(':')) {
            careTokens.push(token);
         } else {
            specTokens.push(token);
         }
      }
      careText = careTokens.join(', ') || 'n/a';
   } else {
      materialText = 'n/a';
      careText = 'n/a';
   }

   // Map specTokens into key–value pairs.
   const specPairs = specTokens
      .map((token) => {
         const parts = token.split(':');
         // Use defaults in case parts[0] or the rest is undefined.
         const key: string = (parts[0] ?? 'n/a').trim();
         const value: string = (parts.slice(1).join(':') || 'n/a').trim();
         return { key, value };
      })
      .filter(({ key, value }) => key !== '' && value !== '');

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
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth=".75"
                        strokeLinecap="round"
                     />
                  </svg>
               ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="currentColor"
                        strokeWidth=".75"
                        strokeLinecap="round"
                     />
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth=".75"
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
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth=".75"
                        strokeLinecap="round"
                     />
                  </svg>
               ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                     <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="currentColor"
                        strokeWidth=".75"
                        strokeLinecap="round"
                     />
                     <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth=".75"
                        strokeLinecap="round"
                     />
                  </svg>
               )}
            </button>
            {specsOpen && (
               <div className="mt-2 pl-4 text-gray-700">
                  {specPairs.length > 0 ? (
                     specPairs.map((pair, index) => (
                        <p key={index}>
                           <strong>{pair.key}:</strong> {pair.value}
                        </p>
                     ))
                  ) : (
                     <p>No specifications available.</p>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
