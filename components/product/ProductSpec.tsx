'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useMemo, useState } from 'react';
import { useProduct, useUpdateSpec } from '../../components/product/product-context';

/* ───────────── helpers (all existing) ───────────── */

function removeMaterialPrefix(text: string): string {
   return text.replace(/^material:\s*/i, '').trim();
}

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
   if (current.trim() !== '') result.push(current.trim());
   return result;
}

/* ───────────── component ───────────── */

export function ProductSpec({
   product,
   materialsCare = '',
   specifications = ''
}: {
   product: Product;
   materialsCare?: string;
   specifications?: string;
}) {
   const { state } = useProduct();
   const updateSpec = useUpdateSpec();

   const [currentSpec, setCurrentSpec] = useState<string>('n/a');
   const [materialsOpen, setMaterialsOpen] = useState<boolean>(false);
   const [specsOpen, setSpecsOpen] = useState<boolean>(false);

   /* pull spec from context if needed */
   useEffect(() => {
      if (state?.spec?.trim()) {
         setCurrentSpec(state.spec);
      } else {
         const fallback =
            product?.options?.find((o) => o.name.toLowerCase() === 'spec')?.values?.[0] ?? 'n/a';
         setCurrentSpec(fallback);
      }
   }, [state, product]);

   /* choose the best source: newly‑split > context > fallback */
   const safeSpec = useMemo(() => {
      const merged = [materialsCare, specifications].filter(Boolean).join(', ').trim();
      const raw = merged || currentSpec;
      return removeMaterialPrefix(raw.replace(/,\s*$/, '').trim());
   }, [materialsCare, specifications, currentSpec]);

   /* ───── Materials & Care parsing (unchanged logic) ───── */

   let materialText = 'n/a';
   let careText = 'n/a';
   let specsPart = '';

   const startParen = safeSpec.indexOf('(');
   if (startParen !== -1) {
      const endParen = safeSpec.indexOf(')', startParen);
      if (endParen !== -1) {
         materialText = safeSpec.substring(0, startParen).trim().replace(/,\s*$/, '');
         careText = safeSpec.substring(startParen, endParen + 1).trim();
         specsPart = safeSpec
            .substring(endParen + 1)
            .trim()
            .replace(/^,/, '')
            .trim();
      } else {
         materialText = safeSpec;
      }
   } else {
      const commaIndex = safeSpec.indexOf(',');
      if (commaIndex !== -1) {
         materialText = safeSpec.substring(0, commaIndex).trim();
         specsPart = safeSpec.substring(commaIndex + 1).trim();
      } else {
         materialText = safeSpec;
      }
   }

   /* ───── Specifications parsing (unchanged logic) ───── */
   const specTokens = specsPart ? splitSpecifications(specsPart) : [];

   /* ───────────── JSX ───────────── */

   return (
      <div className="mb-6">
         {/* Materials & Care */}
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

         {/* Fit & Features */}
         <div className="mb-4 border-b pb-2">
            <button
               onClick={() => setSpecsOpen(!specsOpen)}
               className="flex w-full items-center justify-between text-left text-lg font-normal text-gray-800 hover:opacity-80"
            >
               <span>Fit & Features</span>
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
                  {specTokens.length ? (
                     (() => {
                        // collect resulting JSX nodes here
                        const elements: React.ReactNode[] = [];

                        let i = 0;
                        let firstKeyHandled = false;

                        while (i < specTokens.length) {
                           // guard against undefined just to keep TS happy
                           const token = specTokens[i] ?? '';

                           // ── FIRST key/value pair becomes bullet parent ──
                           if (!firstKeyHandled && token.includes(':')) {
                              const [keyPart, ...valueRest] = token.split(':');
                              const bullets: string[] = [];

                              const firstVal = valueRest.join(':').trim();
                              if (firstVal) bullets.push(firstVal);

                              // gather every following non‑key token
                              let j = i + 1;
                              while (j < specTokens.length && !specTokens[j]?.includes(':')) {
                                 const nextToken = specTokens[j];
                                 if (nextToken) bullets.push(nextToken.trim());
                                 j++;
                              }

                              elements.push(
                                 <div key={`first-${keyPart?.trim()}`} className="mb-2">
                                    <p className="font-semibold">{keyPart?.trim()}:</p>
                                    {bullets.length > 0 && (
                                       <ul className="ml-4 list-inside list-disc space-y-1">
                                          {bullets.map((b, idx) => (
                                             <li key={idx}>{b}</li>
                                          ))}
                                       </ul>
                                    )}
                                 </div>
                              );

                              i = j; // jump past the bullet tokens
                              firstKeyHandled = true;
                              continue;
                           }

                           // ── every other token renders exactly like before ──
                           elements.push(
                              <p key={i}>
                                 {token.includes(':') ? (
                                    <>
                                       <strong>{token.split(':')[0]?.trim()}:</strong>{' '}
                                       {token.split(':').slice(1).join(':').trim()}
                                    </>
                                 ) : (
                                    token
                                 )}
                              </p>
                           );

                           i++;
                        }

                        return <>{elements}</>;
                     })()
                  ) : (
                     <p>No specifications available.</p>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
