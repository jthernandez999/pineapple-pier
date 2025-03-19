'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

//
// Helper: Remove a leading "Material:" prefix (case-insensitive)
function removeMaterialPrefix(text: string): string {
   return text.replace(/^material:\s*/i, '').trim();
}

//
// Helper: Split specifications into tokens by commas that are not inside parentheses.
function splitSpecifications(spec: string): string[] {
   const result: string[] = [];
   let current = '';
   let level = 0;
   for (let i = 0; i < spec.length; i++) {
      const char = spec[i];
      if (char === '(') level++;
      else if (char === ')') level--;
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
   // Initialize with a default spec string.
   const [currentSpec, setCurrentSpec] = useState<string>('n/a');

   // Dropdown states for Materials & Care and Specifications
   const [materialsOpen, setMaterialsOpen] = useState<boolean>(false);
   const [specsOpen, setSpecsOpen] = useState<boolean>(false);

   useEffect(() => {
      if (state && typeof state.spec === 'string' && state.spec.trim() !== '') {
         setCurrentSpec(state.spec);
      } else {
         console.warn('No "spec" found in state, using fallback from product options.');
         const fallbackSpec: string =
            product?.options?.find((opt) => opt.name.toLowerCase() === 'spec')?.values?.[0] ??
            'n/a';
         setCurrentSpec(fallbackSpec);
      }
   }, [state, product]);

   // Work with a safe string:
   let safeSpec = (currentSpec ?? 'n/a').trim();
   // Remove any trailing commas.
   safeSpec = safeSpec.replace(/,\s*$/, '');
   // Remove any "Material:" prefix.
   safeSpec = removeMaterialPrefix(safeSpec);

   //
   // --- Materials & Care Parsing ---
   //
   // We now try to detect a care instructions group in parentheses.
   let materialText = 'n/a';
   let careText = 'n/a';
   let specsPart = '';

   const startParen = safeSpec.indexOf('(');
   if (startParen !== -1) {
      const endParen = safeSpec.indexOf(')', startParen);
      if (endParen !== -1) {
         // Everything before the parentheses is the full materials string (even if it has commas).
         materialText = safeSpec.substring(0, startParen).trim().replace(/,\s*$/, '');
         // Extract the care instructions (including the parentheses).
         careText = safeSpec.substring(startParen, endParen + 1).trim();
         // The remainder after the closing parenthesis are additional specifications.
         specsPart = safeSpec.substring(endParen + 1).trim();
         if (specsPart.startsWith(',')) {
            specsPart = specsPart.substring(1).trim();
         }
      } else {
         // No closing parenthesis found, treat the whole thing as materials.
         materialText = safeSpec;
      }
   } else {
      // No parentheses found.
      // If there is a comma, assume it separates materials from specifications.
      const commaIndex = safeSpec.indexOf(',');
      if (commaIndex !== -1) {
         materialText = safeSpec.substring(0, commaIndex).trim();
         specsPart = safeSpec.substring(commaIndex + 1).trim();
      } else {
         materialText = safeSpec;
      }
   }

   //
   // --- Specifications Parsing ---
   //
   const specificationTokens = specsPart ? splitSpecifications(specsPart) : [];
   // Optionally, you can further process each specification token (e.g., split key/value on colon)
   const specPairs = specificationTokens.map((token) => {
      const parts = token.split(':');
      const key = parts[0]?.trim() || '';
      const value = parts.slice(1).join(':').trim();
      return { key, value };
   });

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
                  <p>
                     <strong>Material:</strong> {materialText}
                  </p>
                  <p>
                     <strong>Care:</strong> {careText}
                  </p>
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
                  {specificationTokens.length > 0 ? (
                     specificationTokens.map((spec, index) => (
                        <p key={index}>
                           {spec.includes(':') ? (
                              <>
                                 <strong>{spec.split(':')[0]?.trim()}:</strong>{' '}
                                 {spec.split(':').slice(1).join(':').trim()}
                              </>
                           ) : (
                              spec
                           )}
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
