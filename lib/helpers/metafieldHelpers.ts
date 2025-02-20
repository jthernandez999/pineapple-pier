// lib/helpers/metafieldHelpers.ts

export type Metafield = {
   key: string;
   value: string;
};

export function flattenMetafields(product: any): Metafield[] {
   // Check for a plural metafields property first.
   if (product.metafields) {
      if (Array.isArray(product.metafields)) {
         return product.metafields;
      } else if (product.metafields.edges) {
         return product.metafields.edges.map((edge: any) => edge.node);
      }
   }
   // Fallback: if there's a singular metafield, return it as an array.
   if (product.metafield) {
      return [{ key: 'color-pattern', value: product.metafield.value }];
   }
   return [];
}

/**
 * getSwatchMetaobjectId
 *
 * Searches the product's metafields (flattened via flattenMetafields)
 * for the metafield with key "color-pattern", then parses its JSON value
 * (expected to be an array of metaobject IDs) and returns the first ID.
 */
export function getSwatchMetaobjectId(product: any): string | undefined {
   const metafields = flattenMetafields(product);
   const found = metafields.find((mf: Metafield) => mf.key === 'color-pattern');
   if (found && found.value) {
      try {
         const metaobjectIds: string[] = JSON.parse(found.value);
         console.log(
            `getSwatchMetaobjectId: For product ${product.handle} - parsed metaobject IDs:`,
            metaobjectIds
         );
         if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
            return metaobjectIds[0];
         }
      } catch (error) {
         console.error(
            `getSwatchMetaobjectId: Error parsing metafield value for product ${product.handle}:`,
            error
         );
      }
   }
   console.log(`getSwatchMetaobjectId: No valid metaobject ID found for product ${product.handle}`);
   return undefined;
}

/**
 * dynamicMetaobjectId is a convenience wrapper around getSwatchMetaobjectId,
 * emphasizing that this value is dynamically derived from the product's metafields.
 */
export const dynamicMetaobjectId = (product: any): string | undefined =>
   getSwatchMetaobjectId(product);

export async function getProductGroupMetaobjectId(product: any): Promise<string | undefined> {
   // Get raw metafields from either product.metafield (single) or product.metafields (array)
   const rawMetafields = product.metafield ? [product.metafield] : product.metafields || [];
   console.log('Product raw metafields:', JSON.stringify(rawMetafields));

   // Look for the metafield with key "product_group"
   const found = rawMetafields.find((mf: any) => mf.key === 'product_group');
   if (found && found.value) {
      try {
         // Parse the value which should be a JSON string representing an array of metaobject IDs
         const metaobjectIds: string[] = JSON.parse(found.value);
         console.log(
            `getProductGroupMetaobjectId: For product ${product.handle} - parsed metaobject IDs:`,
            metaobjectIds
         );
         if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
            const metaobjectId = metaobjectIds[0];
            console.log(
               `getProductGroupMetaobjectId: Querying Shopify API for metaobjectId: ${metaobjectId}`
            );

            // GraphQL query to get the metaobject details
            const query = `
              query GetMetaobject($metaobjectId: ID!) {
                metaobject(id: $metaobjectId) {
                  id
                  type
                  fields {
                    key
                    value
                  }
                }
              }
            `;
            const variables = { metaobjectId };
            console.log('getProductGroupMetaobjectId: Sending query with variables:', variables);
            const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token':
                     process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
               },
               body: JSON.stringify({ query, variables })
            });
            const json = await res.json();
            console.log('getProductGroupMetaobjectId: Shopify API response:', json);
            const metaobject = json.data?.metaobject;
            if (metaobject) {
               // Parse the metaobject fields into an object for easier access.
               const parsedFields = metaobject.fields.reduce(
                  (acc: Record<string, string>, field: any) => {
                     acc[field.key] = field.value;
                     return acc;
                  },
                  {} as Record<string, string>
               );
               console.log(
                  `getProductGroupMetaobjectId: Metaobject fields for product ${product.handle}:`,
                  parsedFields
               );
               // Return the label from the metaobject if available; otherwise, return the metaobject's ID.
               return parsedFields.label || metaobject.id;
            } else {
               console.error(
                  `getProductGroupMetaobjectId: No metaobject data returned for metaobjectId: ${metaobjectId}`
               );
               return undefined;
            }
         }
      } catch (error) {
         console.error(
            `getProductGroupMetaobjectId: Error parsing metafield value for product ${product.handle}:`,
            error
         );
      }
   }
   console.log(
      `getProductGroupMetaobjectId: No valid metaobject ID found for product ${product.handle}`
   );
   return undefined;
}

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

export async function getProductGroupMetaobjectData(
   product: any
): Promise<{ id: string; label: string } | undefined> {
   // Gather raw metafields from product.metafield (singular) or product.metafields (array)
   const rawMetafields = product.metafield ? [product.metafield] : product.metafields || [];
   console.log(`Product (${product.handle}) raw metafields:`, JSON.stringify(rawMetafields));

   // We'll collect all candidate metaobject IDs from all metafields.
   const candidateIds: string[] = [];

   // Iterate over each raw metafield and try to parse its value.
   for (const mf of rawMetafields) {
      try {
         // Expecting the value to be a JSON string representing an array of metaobject IDs.
         const ids: string[] = JSON.parse(mf.value);
         console.log(`Parsed IDs from metafield for product ${product.handle}:`, ids);
         candidateIds.push(...ids);
      } catch (error) {
         console.error(`Error parsing metafield value for product ${product.handle}:`, error);
      }
   }

   if (candidateIds.length === 0) {
      console.log(`No metaobject IDs found for product ${product.handle}`);
      return undefined;
   }

   console.log(`Candidate metaobject IDs for product ${product.handle}:`, candidateIds);

   // Now, query Shopify for each candidate metaobject and filter for type "product_groups"
   const candidates = await Promise.all(
      candidateIds.map(async (id) => {
         console.log(`Querying Shopify API for metaobjectId: ${id}`);
         const query = `
        query GetMetaobject($id: ID!) {
          metaobject(id: $id) {
            id
            type
            fields {
              key
              value
            }
          }
        }
      `;
         const variables = { id };
         console.log('Sending query with variables:', variables);
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
            console.log(`Shopify API response for metaobjectId ${id}:`, JSON.stringify(data));
            if (!data.data) {
               console.error(`No data returned for metaobjectId ${id}`, data);
               return undefined;
            }
            const metaobject = data.data.metaobject;
            if (!metaobject) {
               console.error(`No metaobject found for ID: ${id}`);
               return undefined;
            }
            // Check if the metaobject's type is "product_groups"
            if (metaobject.type === 'product_groups') {
               const parsedFields =
                  metaobject.fields?.reduce(
                     (acc: Record<string, string>, field: any) => {
                        acc[field.key] = field.value;
                        return acc;
                     },
                     {} as Record<string, string>
                  ) || {};
               console.log(`Metaobject fields for ID ${id}:`, parsedFields);
               const label: string = parsedFields.label || metaobject.id || 'Unknown';
               return { id, label };
            } else {
               console.log(`Metaobject ID ${id} is of type "${metaobject.type}", skipping.`);
               return undefined;
            }
         } catch (error) {
            console.error(`Error querying metaobject for ID ${id}:`, error);
            return undefined;
         }
      })
   );

   // Filter out undefined candidates.
   const validCandidates = candidates.filter((c) => c !== undefined) as {
      id: string;
      label: string;
   }[];
   console.log(`Valid candidates for product ${product.handle}:`, validCandidates);

   if (validCandidates.length > 0) {
      // Return the first candidate (or adjust your selection logic as needed).
      return validCandidates[0];
   } else {
      console.log(`No metaobject of type "product_groups" found for product ${product.handle}`);
      return undefined;
   }
}
