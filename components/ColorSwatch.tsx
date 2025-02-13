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
         query GetProductColorMetaobject($productId: ID!) {
            product(id: $productId) {
              id
              metafield(namespace: "shopify", key: "color-pattern") {
                value
                references(first: 1) {
                  edges {
                    node {
                      ... on Metaobject {
                        id
                        type
                        fields {
                          key
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
      `;
         // query GetColorMetaobject($id: ID!) {
         //    metaobject(id: $id) {
         //      id
         //      type
         //      fields {
         //        key
         //        value
         //      }
         //    }
         //  }
         // query GetProductColorMetafield($productId: ID!) {
         //    product(id: $productId) {
         //      metafield(namespace: "shopify", key: "color-pattern") {
         //        value
         //        references(first: 1) {
         //          edges {
         //            node {
         //              ... on Metaobject {
         //                id
         //                fields {
         //                  key
         //                  value
         //                }
         //              }
         //            }
         //          }
         //        }
         //      }
         //    }
         //  }
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
            borderRadius: 'inherit'
         }}
         title={colorCode}
      />
   );
};
