// lib/helpers/metafieldHelpers.ts

export type Metafield = {
   key: string;
   value: string;
};

// In lib/helpers/metaobjectHelpers.ts

/**
 * Normalizes a metaobject ID to a standard format.
 * For example, we could convert it to lower case and trim whitespace.
 */
// In lib/helpers/metafieldHelpers.ts
export function normalizeMetaobjectId(id?: string): string | undefined {
   if (!id) return undefined;
   // Replace any occurrence of "/metaobject/" with "/Metaobject/"
   return id.replace(/\/metaobject\//i, '/Metaobject/');
}

export function flattenMetafields(product: any): Metafield[] {
   const fields: Metafield[] = [];

   if (product.metafields) {
      if (Array.isArray(product.metafields)) {
         fields.push(...product.metafields);
      } else if (product.metafields.edges) {
         fields.push(...product.metafields.edges.map((edge: any) => edge.node));
      }
   }

   if (product.metafield) {
      fields.push({ key: 'color-pattern', value: product.metafield.value });
   }

   if (product.parentGroups) {
      fields.push({ key: 'custom.parent_groups', value: product.parentGroups.value });
   }

   return fields;
}

const metaobjectCache = new Map<string, any>();

export async function fetchMetaobjectData(metaobjectId: string) {
   // If we have the metaobject in our cache, return it
   if (metaobjectCache.has(metaobjectId)) {
      return metaobjectCache.get(metaobjectId);
   }

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

   try {
      const res = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT || '', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token':
               process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''
         },
         body: JSON.stringify({ query, variables }),
         // Next.js caching if applicable:
         next: { revalidate: 60 }
      });
      const json = await res.json();
      const meta = json.data?.metaobject;
      if (meta) {
         metaobjectCache.set(metaobjectId, meta);
      }
      return meta;
   } catch (error) {
      console.error(`Error fetching metaobject data for ${metaobjectId}:`, error);
      return null;
   }
}

/**
 * getProductGroupMetaobjectId
 *
 * Searches the product’s metafields for the custom.parent_groups key.
 * If the value starts with '[', it assumes it's a JSON array of metaobject IDs,
 * fetches the first metaobject (using the cached fetch) and returns an object with its id and label.
 * If it’s not a JSON array, it treats the value as a simple label and returns it.
 */
export async function getProductGroupMetaobjectId(
   product: any
): Promise<{ id: string; label: string } | undefined> {
   const metafields = flattenMetafields(product);
   const found = metafields.find((mf: Metafield) => mf.key === 'custom.parent_groups');
   if (found && found.value) {
      try {
         let parsedValue: any;
         if (found.value.trim().startsWith('[')) {
            parsedValue = JSON.parse(found.value);
         } else {
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
               const meta = await fetchMetaobjectData(metaobjectId);
               if (meta && meta.fields) {
                  const parsedFields = meta.fields.reduce(
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
                  return { id: meta.id, label: parsedFields.label || meta.id };
               }
            }
         } else if (typeof parsedValue === 'string') {
            console.log(
               `getProductGroupMetaobjectId: For product ${product.handle} - parent_groups label:`,
               parsedValue
            );
            return { id: parsedValue, label: parsedValue };
         }
      } catch (err) {
         console.error(
            `getProductGroupMetaobjectId: Error parsing parent_groups metafield for product ${product.handle}:`,
            err
         );
      }
   }
   console.log(
      `getProductGroupMetaobjectId: No valid parent_groups metafield found for product ${product.handle}`
   );
   return undefined;
}

/**
 * getColorPatternMetaobjectId
 *
 * Searches the product’s metafields for the key "color-pattern",
 * parses its JSON value (an array of metaobject IDs),
 * logs each metaobject’s fields (fire-and-forget using the cached fetch),
 * and returns the first ID.
 */
export function getColorPatternMetaobjectId(product: any): string | undefined {
   const metafields = flattenMetafields(product);
   const found = metafields.find((mf: Metafield) => mf.key === 'color-pattern');
   if (found && found.value) {
      try {
         const metaobjectIds: string[] = JSON.parse(found.value);
         // console.log(
         //    `getColorPatternMetaobjectId: For product ${product.handle} - parsed color-pattern IDs:`,
         //    metaobjectIds
         // );
         // Fire-and-forget: fetch and log full metaobject data using the cached fetch.
         metaobjectIds.forEach((metaobjectId) => {
            fetchMetaobjectData(metaobjectId)
               .then((meta) => {
                  if (meta && meta.fields) {
                     // console.log(
                     //    `Color pattern metaobject ${meta.id} fields:`,
                     JSON.stringify(meta.fields, null, 2);
                     // );
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
   // console.log(
   //    `getColorPatternMetaobjectId: No valid color-pattern metaobject ID found for product ${product.handle}`
   // );
   return undefined;
}

/**
 * dynamicMetaobjectId is a convenience wrapper around getColorPatternMetaobjectId,
 * emphasizing that this value is dynamically derived from the product's metafields.
 */
export const dynamicMetaobjectId = (product: any): string | undefined =>
   getColorPatternMetaobjectId(product);

/**
 * getProductGroup
 *
 * Uses getProductGroupMetaobjectId to fetch the product group metaobject,
 * then returns its label as a plain string.
 */
export async function getProductGroup(product: any): Promise<string | undefined> {
   const groupData = await getProductGroupMetaobjectId(product);
   return groupData ? groupData.label : undefined;
}
