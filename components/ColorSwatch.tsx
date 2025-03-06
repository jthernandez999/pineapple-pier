'use client';
import React, { useEffect, useState } from 'react';

interface ColorSwatchProps {
   metaobjectId: string;
   fallbackColor: string;
   metaobjectIdsArray?: string[];
}

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
   metaobjectIdsArray,
   metaobjectId,
   fallbackColor
}) => {
   // We start off with our fallback color in an array because, hey, consistency.
   const [colorCodes, setColorCodes] = useState<string[]>([fallbackColor]);

   useEffect(() => {
      // Helper to fetch the color for a single metaobject ID.
      async function fetchMetaobjectColor(id: string): Promise<string> {
         const query = `
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
         const variables = { id };
         try {
            const res = await fetch(SHOPIFY_ENDPOINT, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
               },
               body: JSON.stringify({ query, variables })
            });
            const data = await res.json();
            console.log('Metaobject response:', data);
            if (!data.data) {
               console.error('No data returned for metaobject', id, data);
               return fallbackColor;
            }
            const metaobjectData = data.data.metaobject;
            if (!metaobjectData) {
               console.error('No metaobject data found for ID:', id);
               return fallbackColor;
            }
            // Look for the "color" field
            const colorField = metaobjectData.fields.find((f: any) => f.key === 'color');
            if (colorField?.value) {
               return colorField.value;
            } else {
               console.error('Color field not found in metaobject fields', metaobjectData.fields);
               return fallbackColor;
            }
         } catch (error) {
            console.error('Error fetching metaobject:', error);
            return fallbackColor;
         }
      }

      // If we have an array of metaobject IDs, fetch them all.
      async function fetchColors() {
         if (metaobjectIdsArray && metaobjectIdsArray.length > 0) {
            const colors = await Promise.all(
               metaobjectIdsArray.map((id) => fetchMetaobjectColor(id))
            );
            setColorCodes(colors);
         } else if (metaobjectId) {
            const color = await fetchMetaobjectColor(metaobjectId);
            setColorCodes([color]);
         }
      }

      fetchColors();
   }, [metaobjectId, metaobjectIdsArray, fallbackColor]);

   // Render multiple swatches if we have more than one color code; otherwise, render one.
   return (
      <>
         {colorCodes.length > 1 ? (
            <div style={{ display: 'flex', gap: '4px' }}>
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
         ) : (
            <div
               style={{
                  backgroundColor: colorCodes[0],
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1px solid #ccc'
               }}
               title={colorCodes[0]}
            />
         )}
      </>
   );
};
