// ColorSwatch.tsx
'use client';
import React, { useEffect, useState } from 'react';

interface ColorSwatchProps {
   metaobjectId: string;
   fallbackColor: string;
   metaobjectIdsArray?: string[] | [];
   onColorsFetched?: (colors: string[]) => void;
}

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
   metaobjectId,
   fallbackColor,
   metaobjectIdsArray,
   onColorsFetched
}) => {
   const [colorCodes, setColorCodes] = useState<string[]>([]);

   useEffect(() => {
      async function fetchMetaobject(id: string): Promise<string> {
         const query = /* GraphQL */ `
            query GetMetaobject($id: ID!) {
               metaobject(id: $id) {
                  id
                  fields {
                     key
                     value
                  }
               }
            }
         `;
         try {
            const res = await fetch(SHOPIFY_ENDPOINT, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
               },
               body: JSON.stringify({ query, variables: { id } }),
               // This instructs Next.js to cache the response at the edge and revalidate every 60 seconds.
               next: { revalidate: 60 }
            });
            const data = await res.json();
            if (!data.data?.metaobject) {
               console.error('No metaobject data found for ID:', id, data);
               return fallbackColor;
            }
            const colorField = data.data.metaobject.fields.find((f: any) => f.key === 'color');
            return colorField?.value ?? fallbackColor;
         } catch (error) {
            console.error('Error fetching metaobject:', error);
            return fallbackColor;
         }
      }

      async function fetchColors() {
         // If multiple metaobject IDs exist, fetch them all
         if (metaobjectIdsArray?.length) {
            const colors = await Promise.all(metaobjectIdsArray.map((id) => fetchMetaobject(id)));
            setColorCodes(colors);
            onColorsFetched?.(colors);
         }
         // Otherwise, fetch the single metaobject ID
         else if (metaobjectId) {
            const color = await fetchMetaobject(metaobjectId);
            setColorCodes([color]);
            onColorsFetched?.([color]);
         }
         // Fallback if nothing
         else {
            setColorCodes([fallbackColor]);
         }
      }

      fetchColors();
   }, [metaobjectId, metaobjectIdsArray, fallbackColor, onColorsFetched]);

   if (!colorCodes.length) {
      // Fallback to a single circle of fallbackColor
      return (
         <div
            style={{
               backgroundColor: fallbackColor,
               width: '18px',
               height: '18px',
               borderRadius: '50%',
               border: '1px solid #ccc'
            }}
            title={fallbackColor}
         />
      );
   }

   // Always map colorCodes so you get exactly one circle per color
   return (
      <div style={{ display: 'flex', gap: '6px' }}>
         {colorCodes.map((code, index) => (
            <div
               key={index}
               style={{
                  backgroundColor: code,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1px solid #ccc'
               }}
               title={code}
            />
         ))}
      </div>
   );
};
