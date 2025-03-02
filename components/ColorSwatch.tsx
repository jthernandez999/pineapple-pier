'use client';
import React, { useEffect, useState } from 'react';

interface ColorSwatchProps {
   metaobjectId: string;
   fallbackColor: string;
}

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ metaobjectId, fallbackColor }) => {
   const [colorCode, setColorCode] = useState<string>(fallbackColor);

   useEffect(() => {
      async function fetchMetaobject() {
         // Query the metaobject directly.
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
         const variables = { id: metaobjectId };
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
               console.error('No data returned from metaobject query', data);
               return;
            }
            const metaobjectData = data.data.metaobject;
            if (!metaobjectData) {
               console.error('No metaobject data found for ID:', metaobjectId);
               return;
            }
            // Look for the "color" field instead of "color_code".
            const colorField = metaobjectData.fields.find((f: any) => f.key === 'color');
            if (colorField?.value) {
               setColorCode(colorField.value);
            } else {
               console.error('color field not found in metaobject fields', metaobjectData.fields);
            }
         } catch (error) {
            console.error('Error fetching metaobject:', error);
         }
      }

      if (metaobjectId) {
         fetchMetaobject();
      }
   }, [metaobjectId]);

   return (
      <div
         style={{
            backgroundColor: colorCode,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '1px solid #ccc' // for visibility
         }}
         title={colorCode}
      />
   );
};
