'use client';
import React, { useEffect, useState } from 'react';

interface ColorSwatchProps {
   metaobjectId: string;
   fallbackColor: string;
   metaobjectIdsArray?: string[];
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
   // We store our color(s) in an array.
   const [colorCodes, setColorCodes] = useState<string[]>([fallbackColor]);

   useEffect(() => {
      async function fetchMetaobject(id: string): Promise<string> {
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
            console.log('DATA FROM COLORSWATCH::::', data);
            if (!data.data) {
               console.error('No data returned for metaobject', id, data);
               return fallbackColor;
            }
            const metaobjectData = data.data.metaobject;
            if (!metaobjectData) {
               console.error('No metaobject data found for ID:', id);
               return fallbackColor;
            }
            // Look for the "color" field.
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

      async function fetchColors() {
         if (metaobjectIdsArray && metaobjectIdsArray.length > 0) {
            const colors = await Promise.all(metaobjectIdsArray.map((id) => fetchMetaobject(id)));
            setColorCodes(colors);
            if (onColorsFetched) onColorsFetched(colors);
         } else if (metaobjectId) {
            const color = await fetchMetaobject(metaobjectId);
            setColorCodes([color]);
            if (onColorsFetched) onColorsFetched([color]);
         }
      }
      fetchColors();
   }, [metaobjectId, metaobjectIdsArray, fallbackColor, onColorsFetched]);

   // Render multiple swatches if we have more than one color; otherwise, render one.
   if (colorCodes.length > 1) {
      return (
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
      );
   }
   return (
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
   );
};
