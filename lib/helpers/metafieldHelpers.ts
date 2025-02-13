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
