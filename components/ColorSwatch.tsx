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
         const query = `
        query GetColorMetaobject($id: ID!) {
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
            // Look for the field with key "color_code"
            const field = data.data?.metaobject?.fields?.find((f: any) => f.key === 'color_code');
            if (field && field.value) {
               setColorCode(field.value);
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
            width: '100%',
            height: '100%',
            borderRadius: 'inherit' // Inherit the parent's borderRadius so it remains circular.
         }}
         title={colorCode}
      />
   );
};
