// lib/helpers/metafieldHelpers.ts
export type Metafield = {
   key: string;
   value: string;
};

// This helper handles both flat arrays and connection objects.
export function flattenMetafields(product: any): Metafield[] {
   if (!product) return [];
   if (Array.isArray(product.metafields)) {
      return product.metafields;
   } else if (product.metafields && product.metafields.edges) {
      return product.metafields.edges.map((edge: any) => edge.node);
   }
   return [];
}

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
