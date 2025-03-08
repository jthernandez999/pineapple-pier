// ColorSwatch.tsx
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
   const [colorCodes, setColorCodes] = useState<string[]>([]);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

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
               next: { revalidate: 60 }
            });
            const data = await res.json();
            if (!data.data?.metaobject) {
               console.error('No metaobject data found for ID:', id, data);
               return fallbackColor;
            }
            // Check for a field called "color" (or update this to your actual field name)
            const colorField =
               data.data.metaobject.fields.find((f: any) => f.key.toLowerCase() === 'color') ||
               data.data.metaobject.fields.find((f: any) => f.key.toLowerCase() === 'swatch_color');
            return colorField?.value ?? fallbackColor;
         } catch (error) {
            console.error('Error fetching metaobject:', error);
            return fallbackColor;
         }
      }

      async function fetchColors() {
         let idsToFetch: string[] = [];
         if (metaobjectIdsArray && metaobjectIdsArray.length > 1) {
            idsToFetch = metaobjectIdsArray;
         } else if (metaobjectId) {
            idsToFetch = [metaobjectId];
         }

         if (idsToFetch.length) {
            const colors = await Promise.all(idsToFetch.map((id) => fetchMetaobject(id)));
            setColorCodes(colors);
            onColorsFetched?.(colors);
         } else {
            setColorCodes([fallbackColor]);
         }
      }

      fetchColors();
   }, [metaobjectId, metaobjectIdsArray, fallbackColor, onColorsFetched]);

   // Only render once mounted to avoid hydration mismatch.
   if (!mounted) {
      return null;
   }

   // If we haven't fetched colors yet, render nothing (or a loading spinner if you prefer).
   if (!colorCodes.length) {
      return null;
   }

   // Render a swatch for each color code.
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
