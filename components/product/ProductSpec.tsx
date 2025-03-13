'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

//
// Helper: finds the first comma that's not inside parentheses and splits the string into two parts.
// If no comma is found, the entire string is returned as the "material" part.
function splitAtFirstComma(specs: string): { firstPart: string; rest: string } {
   let level = 0;
   for (let i = 0; i < specs.length; i++) {
      const char = specs[i];
      if (char === '(') level++;
      else if (char === ')') level--;
      else if (char === ',' && level === 0) {
         return {
            firstPart: specs.substring(0, i).trim(),
            rest: specs.substring(i + 1).trim()
         };
      }
   }
   return { firstPart: specs.trim(), rest: '' };
}

//
// Helper: extract the first parenthesized group from a string.
// Returns an object with the text outside the first parentheses (trimmed)
// and the content of the first parentheses (including the parentheses).
// If no parentheses found, returns the original text and an empty care.
function extractFirstParenthesis(text: string): { withoutParen: string; care: string } {
   const start = text.indexOf('(');
   if (start !== -1) {
      const end = text.indexOf(')', start);
      if (end !== -1) {
         const care = text.substring(start, end + 1).trim();
         const withoutParen = (text.substring(0, start) + text.substring(end + 1)).trim();
         return { withoutParen, care };
      }
   }
   return { withoutParen: text.trim(), care: '' };
}

//
// Helper: Remove a leading "Material:" prefix (case-insensitive)
function removeMaterialPrefix(text: string): string {
   return text.replace(/^material:\s*/i, '').trim();
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

   // --- Materials & Care Parsing ---

   // Split at the first comma that is outside of any parentheses.
   const { firstPart, rest } = splitAtFirstComma(safeSpec);

   // Remove any "Material:" prefix from the first part.
   const cleanedFirst = removeMaterialPrefix(firstPart);

   // Extract the first parenthesis group as care.
   const { withoutParen: materialTextRaw, care: careTextRaw } =
      extractFirstParenthesis(cleanedFirst);

   // Material text is what remains (or the whole text if no parenthesis was found).
   const materialText = materialTextRaw || 'n/a';
   // Use the extracted care text if found; if not, default to 'n/a'.
   const careText = careTextRaw || 'n/a';

   // --- Specifications Parsing ---
   // Use the rest of the string (after the first comma) for specifications.
   // Split on commas that are not inside parentheses.
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
   const specificationTokens = rest ? splitSpecifications(rest) : [];

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
