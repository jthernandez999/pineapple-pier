// lib/helpers/metafieldHelpers.ts

export type Metafield = {
   key: string;
   value: string;
};

/**
 * flattenMetafields
 *
 * Returns an array of metafield objects from the product.
 * It handles both singular and plural metafields.
 * It also pushes an aliased field for parent groups (custom.parent_groups)
 * if the product query provided an alias (i.e. product.parentGroups).
 */
export function flattenMetafields(product: any): Metafield[] {
   const fields: Metafield[] = [];

   // Process standard metafields if present.
   if (product.metafields) {
      if (Array.isArray(product.metafields)) {
         fields.push(...product.metafields);
      } else if (product.metafields.edges) {
         fields.push(...product.metafields.edges.map((edge: any) => edge.node));
      }
   }

   // Fallback: check for a singular metafield (assumed to be color-pattern).
   if (product.metafield) {
      fields.push({ key: 'color-pattern', value: product.metafield.value });
   }

   // Include the aliased custom parent groups field.
   // (The query aliases this as "parentGroups")
   if (product.parentGroups) {
      fields.push({ key: 'custom.parent_groups', value: product.parentGroups.value });
   }

   return fields;
}

/**
 * fetchMetaobjectData
 *
 * Given a metaobject ID, fetch its full data from Shopify.
 */
export async function fetchMetaobjectData(metaobjectId: string) {
   const query = /* GraphQL */ `
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
   const variables = { id: metaobjectId };
   const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
      },
      body: JSON.stringify({ query, variables })
   });
   const json = await res.json();
   return json.data.metaobject;
}

/**
 * getColorPatternMetaobjectId
 *
 * Searches the product’s metafields for the key "color-pattern",
 * parses its JSON value (an array of metaobject IDs),
 * logs each metaobject’s fields (fire-and-forget), and returns the first ID.
 */
export function getColorPatternMetaobjectId(product: any): string | undefined {
   const metafields = flattenMetafields(product);
   const found = metafields.find((mf: Metafield) => mf.key === 'color-pattern');
   if (found && found.value) {
      try {
         const metaobjectIds: string[] = JSON.parse(found.value);
         console.log(
            `getColorPatternMetaobjectId: For product ${product.handle} - parsed color-pattern IDs:`,
            metaobjectIds
         );
         // Fire-and-forget: fetch and log full metaobject data for debugging.
         metaobjectIds.forEach((metaobjectId) => {
            fetchMetaobjectData(metaobjectId)
               .then((meta) => {
                  if (meta && meta.fields) {
                     console.log(
                        `Color pattern metaobject ${meta.id} fields:`,
                        JSON.stringify(meta.fields, null, 2)
                     );
                  }
               })
               .catch((err) =>
                  console.error(
                     `Error fetching color pattern metaobject data for ${metaobjectId}:`,
                     err
                  )
               );
         });
         if (metaobjectIds.length > 0) {
            return metaobjectIds[0];
         }
      } catch (err) {
         console.error(
            `getColorPatternMetaobjectId: Error parsing metafield value for product ${product.handle}:`,
            err
         );
      }
   }
   console.log(
      `getColorPatternMetaobjectId: No valid color-pattern metaobject ID found for product ${product.handle}`
   );
   return undefined;
}

/**
 * getProductGroupMetaobjectId
 *
 * Searches the product’s metafields for the custom parent groups field
 * (aliased as "custom.parent_groups"). For this field, the value may be
 * either a JSON array of metaobject IDs or a simple string.
 * If it’s an array, it will fetch the metaobject data for the first ID;
 * if it’s a string, it is returned directly as the group label.
 */
export async function getProductGroupMetaobjectId(product: any): Promise<string | undefined> {
   const metafields = flattenMetafields(product);
   const found = metafields.find((mf: Metafield) => mf.key === 'custom.parent_groups');
   if (found && found.value) {
      let parsedValue: any;
      try {
         if (found.value.trim().startsWith('[')) {
            parsedValue = JSON.parse(found.value);
         } else {
            parsedValue = found.value;
         }
      } catch (err) {
         console.error(
            `getProductGroupMetaobjectId: Error parsing parent_groups metafield for product ${product.handle}:`,
            err
         );
         parsedValue = found.value;
      }
      if (Array.isArray(parsedValue)) {
         console.log(
            `getProductGroupMetaobjectId: For product ${product.handle} - parsed parent_groups IDs:`,
            parsedValue
         );
         if (parsedValue.length > 0) {
            const metaobjectId = parsedValue[0];
            console.log(
               `getProductGroupMetaobjectId: Querying Shopify API for parent group metaobjectId: ${metaobjectId}`
            );
            const query = /* GraphQL */ `
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
            try {
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
                  // Reduce the fields into an object.
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
                  return parsedFields.label || metaobject.id;
               } else {
                  console.error(
                     `getProductGroupMetaobjectId: No metaobject data returned for metaobjectId: ${metaobjectId}`
                  );
                  return undefined;
               }
            } catch (err) {
               console.error(
                  `getProductGroupMetaobjectId: Error fetching metaobject data for metaobjectId ${metaobjectId}:`,
                  err
               );
               return undefined;
            }
         }
      } else if (typeof parsedValue === 'string') {
         console.log(
            `getProductGroupMetaobjectId: For product ${product.handle} - parent_groups label:`,
            parsedValue
         );
         return parsedValue;
      }
   }
   console.log(
      `getProductGroupMetaobjectId: No valid parent_groups metafield found for product ${product.handle}`
   );
   return undefined;
}

/**
 * dynamicMetaobjectId is a convenience wrapper around getColorPatternMetaobjectId,
 * emphasizing that this value is dynamically derived from the product's metafields.
 */
export const dynamicMetaobjectId = (product: any): string | undefined =>
   getColorPatternMetaobjectId(product);

// (The getProductGroupMetaobjectData function remains similar to your previous version,
//  which can be used by components that need the product group label and ID.)
export async function getProductGroupMetaobjectData(
   product: any
): Promise<{ id: string; label: string } | undefined> {
   const rawMetafields = product.metafield ? [product.metafield] : product.metafields || [];
   console.log(`Product (${product.handle}) raw metafields:`, JSON.stringify(rawMetafields));

   const candidateIds: string[] = [];
   for (const mf of rawMetafields) {
      try {
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

   const candidates = await Promise.all(
      candidateIds.map(async (id) => {
         console.log(`Querying Shopify API for metaobjectId: ${id}`);
         const query = /* GraphQL */ `
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
            console.log(`Metaobject data for ${id}:`, data);
            if (!data.data) {
               console.error(`No data returned for metaobjectId ${id}`, data);
               return undefined;
            }
            const metaobject = data.data.metaobject;
            if (!metaobject) {
               console.error(`No metaobject found for ID: ${id}`);
               return undefined;
            }
            if (metaobject.type === 'parent_groups') {
               const parsedFields = metaobject.fields.reduce(
                  (acc: Record<string, string>, field: any) => {
                     acc[field.key] = field.value;
                     return acc;
                  },
                  {} as Record<string, string>
               );
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

   const validCandidates = candidates.filter((c) => c !== undefined) as {
      id: string;
      label: string;
   }[];
   console.log(`Valid candidates for product ${product.handle}:`, validCandidates);

   if (validCandidates.length > 0) {
      return validCandidates[0];
   } else {
      console.log(`No metaobject of type "parent_groups" found for product ${product.handle}`);
      return undefined;
   }
}

const SHOPIFY_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
