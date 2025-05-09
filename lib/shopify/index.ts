import { HIDDEN_PRODUCT_TAG, SHOPIFY_GRAPHQL_API_ENDPOINT, TAGS } from 'lib/constants';
import { isShopifyError } from 'lib/type-guards';
import { ensureStartsWith } from 'lib/utils';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
   addToCartMutation,
   createCartMutation,
   editCartItemsMutation,
   removeFromCartMutation
} from './mutations/cart';
import { getCartQuery } from './queries/cart';
import {
   getCollectionProductsQuery,
   getCollectionQuery,
   getCollectionsQuery
} from './queries/collection';
import { getMenuQuery } from './queries/menu';
import { getPageQuery, getPagesQuery } from './queries/page';
import {
   getProductQuery,
   getProductRecommendationsQuery,
   getProductsQuery
} from './queries/product';
import {
   Cart,
   Collection,
   Connection,
   Image,
   Menu,
   MenuItem,
   Page,
   Product,
   ShopifyAddToCartOperation,
   ShopifyCart,
   ShopifyCartOperation,
   ShopifyCollection,
   ShopifyCollectionOperation,
   ShopifyCollectionProductsOperation,
   ShopifyCollectionsOperation,
   ShopifyCreateCartOperation,
   ShopifyMenuOperation,
   ShopifyPageOperation,
   ShopifyPagesOperation,
   ShopifyProduct,
   ShopifyProductOperation,
   ShopifyProductRecommendationsOperation,
   ShopifyProductsOperation,
   ShopifyRemoveFromCartOperation,
   ShopifyUpdateCartOperation
} from './types';

const domain = process.env.SHOPIFY_STORE_DOMAIN
   ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, 'https://')
   : '';
const endpoint = `https://pineapple-pier.myshopify.com${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object } ? T['variables'] : never;

export async function shopifyFetch<T>({
   cache = 'force-cache',
   // cache = 'no-store',
   headers,
   query,
   tags,
   variables
}: {
   cache?: RequestCache;
   headers?: HeadersInit;
   query: string;
   tags?: string[];
   variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
   try {
      // console.log('Fetching collection products with variables:', variables);
      // console.log('Using cache tags:', tags);

      const result = await fetch(endpoint, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': key,
            ...headers
         },
         body: JSON.stringify({
            ...(query && { query }),
            ...(variables && { variables })
         }),
         cache,
         ...(tags && { next: { tags } })
      });

      const body = await result.json();

      if (body.errors) {
         throw body.errors[0];
      }

      return {
         status: result.status,
         body
      };
   } catch (e) {
      if (isShopifyError(e)) {
         throw {
            cause: e.cause?.toString() || 'unknown',
            status: e.status || 500,
            message: e.message,
            query
         };
      }

      throw {
         error: e,
         query
      };
   }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
   return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
   if (!cart.cost?.totalTaxAmount) {
      cart.cost.totalTaxAmount = {
         amount: '0.0',
         currencyCode: cart.cost.totalAmount.currencyCode
      };
   }

   return {
      ...cart,
      lines: removeEdgesAndNodes(cart.lines)
   };
};

const reshapeCollection = (collection: ShopifyCollection): Collection | undefined => {
   if (!collection) {
      return undefined;
   }

   return {
      ...collection,
      path: `/search/${collection.handle}`
   };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
   const reshapedCollections = [];

   for (const collection of collections) {
      if (collection) {
         const reshapedCollection = reshapeCollection(collection);

         if (reshapedCollection) {
            reshapedCollections.push(reshapedCollection);
         }
      }
   }

   return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
   const flattened = removeEdgesAndNodes(images);

   return flattened.map((image) => {
      const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
      return {
         ...image,
         altText: image.altText || `${productTitle} - ${filename}`
      };
   });
};

// In your /lib/shopify/index.ts file:

const reshapeProduct = (
   product: ShopifyProduct,
   filterHiddenProducts: boolean = true
): Product | undefined => {
   if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
      return undefined;
   }

   const { images, variants, metafield, ...rest } = product;

   // Normalize metafield:
   // If metafield is an array with a single item, return that item.
   // Otherwise, if it’s an array with more than one element, we assume you need the array (for grouped products).
   // (If you want to update your Product type, change metafield’s type to Metafield | Metafield[].)
   let normalizedMetafield: any;
   if (Array.isArray(metafield)) {
      normalizedMetafield = metafield.length === 1 ? metafield[0] : metafield;
   } else {
      normalizedMetafield = metafield;
   }

   return {
      ...rest,
      metafield: normalizedMetafield,
      images: reshapeImages(images, product.title),
      variants: removeEdgesAndNodes(variants)
   } as Product; // cast to Product if needed
};

// const reshapeProduct = (product: ShopifyProduct, filterHiddenProducts: boolean = true) => {
//    if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
//       return undefined;
//    }

//    const { images, variants, ...rest } = product;

//    return {
//       ...rest,
//       images: reshapeImages(images, product.title),
//       variants: removeEdgesAndNodes(variants)
//    };
// };

const reshapeProducts = (products: ShopifyProduct[]) => {
   const reshapedProducts = [];
   for (const product of products) {
      if (product) {
         const reshapedProduct = reshapeProduct(product);
         if (reshapedProduct) {
            reshapedProducts.push(reshapedProduct);
         }
      }
   }
   return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
   const res = await shopifyFetch<ShopifyCreateCartOperation>({
      query: createCartMutation,
      cache: 'no-store'
   });
   return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
   cartId: string,
   lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
   const res = await shopifyFetch<ShopifyAddToCartOperation>({
      query: addToCartMutation,
      variables: {
         cartId,
         lines
      },
      cache: 'no-store'
   });
   return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
   const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
      query: removeFromCartMutation,
      variables: {
         cartId,
         lineIds
      },
      cache: 'no-store'
   });
   return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
   cartId: string,
   lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
   const res = await shopifyFetch<ShopifyUpdateCartOperation>({
      query: editCartItemsMutation,
      variables: {
         cartId,
         lines
      },
      cache: 'no-store'
   });
   return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(cartId: string | undefined): Promise<Cart | undefined> {
   if (!cartId) {
      return undefined;
   }
   const res = await shopifyFetch<ShopifyCartOperation>({
      query: getCartQuery,
      variables: { cartId },
      tags: [TAGS.cart]
   });
   // Old carts become `null` when you checkout.
   if (!res.body.data.cart) {
      return undefined;
   }
   return reshapeCart(res.body.data.cart);
}

// const reshapeProducts = (products: ShopifyProduct[]) => {
//    const reshapedProducts = [];

//    for (const product of products) {
//       if (product) {
//          const reshapedProduct = reshapeProduct(product);

//          if (reshapedProduct) {
//             reshapedProducts.push(reshapedProduct);
//          }
//       }
//    }

//    return reshapedProducts;
// };

// export async function createCart(cartId: string): Promise<Cart> {
//    const res = await shopifyFetch<ShopifyCreateCartOperation>({
//       query: createCartMutation,
//       cache: 'no-store'
//    });

//    return reshapeCart(res.body.data.cartCreate.cart);
// }

// export async function addToCart(
//    cartId: string,
//    lines: { merchandiseId: string; quantity: number }[]
// ): Promise<Cart> {
//    const res = await shopifyFetch<ShopifyAddToCartOperation>({
//       query: addToCartMutation,
//       variables: {
//          cartId,
//          lines
//       },
//       cache: 'no-store'
//    });
//    return reshapeCart(res.body.data.cartLinesAdd.cart);
// }

// export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
//    const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
//       query: removeFromCartMutation,
//       variables: {
//          cartId,
//          lineIds
//       },
//       cache: 'no-store'
//    });

//    return reshapeCart(res.body.data.cartLinesRemove.cart);
// }

// export async function updateCart(
//    cartId: string,
//    lines: { id: string; merchandiseId: string; quantity: number }[]
// ): Promise<Cart> {
//    const res = await shopifyFetch<ShopifyUpdateCartOperation>({
//       query: editCartItemsMutation,
//       variables: {
//          cartId,
//          lines
//       },
//       cache: 'no-store'
//    });

//    return reshapeCart(res.body.data.cartLinesUpdate.cart);
// }

// export async function getCart(cartId: string | undefined): Promise<Cart | undefined> {
//    if (!cartId) {
//       return undefined;
//    }

//    const res = await shopifyFetch<ShopifyCartOperation>({
//       query: getCartQuery,
//       variables: { cartId },
//       tags: [TAGS.cart]
//    });

//    // Old carts becomes `null` when you checkout.
//    if (!res.body.data.cart) {
//       return undefined;
//    }

//    return reshapeCart(res.body.data.cart);
// }

export async function getCollection(handle: string): Promise<Collection | undefined> {
   const res = await shopifyFetch<ShopifyCollectionOperation>({
      query: getCollectionQuery,
      tags: [TAGS.collections],
      variables: {
         handle
      }
   });

   return reshapeCollection(res.body.data.collection);
}

// export async function getCollectionProducts({
//    collection,
//    reverse,
//    sortKey
// }: {
//    collection: string;
//    reverse?: boolean;
//    sortKey?: string;
// }): Promise<Product[]> {
//    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
//       query: getCollectionProductsQuery,
//       tags: [TAGS.collections, TAGS.products],
//       variables: {
//          handle: collection,
//          reverse,
//          sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
//       }
//    });

//    if (!res.body.data.collection) {
//       console.log(`No collection found for \`${collection}\``);
//       return [];
//    }

//    return reshapeProducts(removeEdgesAndNodes(res.body.data.collection.products));
// }

export async function getCollectionProducts({
   collection,
   reverse,
   sortKey,
   cursor,
   filters // e.g., { size?: string, color?: string, ... }
}: {
   collection: string;
   reverse?: boolean;
   sortKey?: string;
   cursor?: string;
   filters?: { [key: string]: string };
}): Promise<{
   products: Product[];
   pageInfo: { endCursor: string | null; hasNextPage: boolean };
}> {
   // Build variables object only with required parameters.
   const variables: {
      handle: string;
      cursor?: string;
      sortKey?: string;
      reverse?: boolean;
      filters?: { [key: string]: string };
   } = { handle: collection };

   if (sortKey !== undefined) {
      variables.sortKey = sortKey === 'CREATED_AT' ? 'CREATED' : sortKey;
   }
   if (reverse !== undefined) {
      variables.reverse = reverse;
   }
   if (cursor) {
      variables.cursor = cursor;
   }
   if (filters) {
      variables.filters = filters;
   }

   const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getCollectionProductsQuery,
      tags: [TAGS.collections, TAGS.products],
      variables
   });

   if (!res.body.data.collection) {
      return { products: [], pageInfo: { endCursor: null, hasNextPage: false } };
   }
   const productsData = res.body.data.collection.products as any;
   const pageInfo = productsData.pageInfo as { hasNextPage: boolean; endCursor: string | null };
   const products = reshapeProducts(removeEdgesAndNodes(productsData));
   return { products, pageInfo };
}

// CURRENT WORKING CODE
// export async function getCollectionProducts({
//    collection,
//    reverse,
//    sortKey,
//    cursor
// }: {
//    collection: string;
//    reverse?: boolean;
//    sortKey?: string;
//    cursor?: string;
// }): Promise<{
//    products: Product[];
//    pageInfo: { endCursor: string | null; hasNextPage: boolean };
// }> {
//    // Build variables object only with required parameters.
//    const variables: { handle: string; cursor?: string; sortKey?: string; reverse?: boolean } = {
//       handle: collection
//    };

//    // Only add sortKey and reverse if they're explicitly provided.
//    if (sortKey !== undefined) {
//       // If the provided sortKey is 'CREATED_AT', map it to Shopify's expected 'CREATED'
//       variables.sortKey = sortKey === 'CREATED_AT' ? 'CREATED' : sortKey;
//    }
//    if (reverse !== undefined) {
//       variables.reverse = reverse;
//    }

//    // console.log('Using variables:', variables);

//    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
//       query: getCollectionProductsQuery,
//       tags: [TAGS.collections, TAGS.products],
//       variables
//    });

//    if (!res.body.data.collection) {
//       // console.log(`No collection found for \`${collection}\``);
//       return { products: [], pageInfo: { endCursor: null, hasNextPage: false } };
//    }
//    const productsData = res.body.data.collection.products as any;
//    const pageInfo = productsData.pageInfo as { hasNextPage: boolean; endCursor: string | null };
//    const products = reshapeProducts(removeEdgesAndNodes(productsData));
//    return { products, pageInfo };
// }

// export async function getCollectionProducts({
//    collection,
//    reverse,
//    sortKey,
//    cursor
// }: {
//    collection: string;
//    reverse?: boolean;
//    sortKey?: string;
//    cursor?: string;
// }): Promise<{
//    products: Product[];
//    pageInfo: {
//       endCursor: string | null;
//       hasNextPage: boolean;
//    };
// }> {
//    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
//       query: getCollectionProductsQuery,
//       tags: [TAGS.collections, TAGS.products],
//       // Cast to any so that we can add the optional cursor property
//       variables: {
//          handle: collection,
//          reverse,
//          sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey,
//          cursor // optional; if undefined, it’s omitted
//       } as any
//    });

//    if (!res.body.data.collection) {
//       console.log(`No collection found for \`${collection}\``);
//       return { products: [], pageInfo: { endCursor: null, hasNextPage: false } };
//    }
//    const productsData = res.body.data.collection.products as any; // cast to any to access pageInfo
//    console.log('Raw collection products response:::', res.body.data.collection.products);
//    console.log(productsData.edges[0].node);

//    const pageInfo = productsData.pageInfo as { hasNextPage: boolean; endCursor: string | null };

//    //  const productsData = res.body.data.collection.products;
//    // TypeScript now expects productsData to include a pageInfo property.
//    // If your Shopify type (Connection<ShopifyProduct>) doesn’t include it,
//    // you may need to extend that type or cast accordingly.
//    //  const pageInfo = productsData.pageInfo;
//    const products = reshapeProducts(removeEdgesAndNodes(productsData));
//    return { products, pageInfo };
// }

export async function getCollections(): Promise<Collection[]> {
   const res = await shopifyFetch<ShopifyCollectionsOperation>({
      query: getCollectionsQuery,
      tags: [TAGS.collections]
   });
   const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
   const collections = [
      {
         handle: '',
         title: 'All',
         description: 'All products',
         seo: {
            title: 'All',
            description: 'All products'
         },
         path: '/search',
         updatedAt: new Date().toISOString()
      },
      // Filter out the `hidden` collections.
      // Collections that start with `hidden-*` need to be hidden on the search page.
      ...reshapeCollections(shopifyCollections).filter(
         (collection) => !collection.handle.startsWith('hidden')
      )
   ];

   return collections;
}

// export async function getMenu(handle: string): Promise<Menu[]> {
//   const res = await shopifyFetch<ShopifyMenuOperation>({
//     query: getMenuQuery,
//     tags: [TAGS.collections],
//     variables: {
//       handle
//     }
//   });

//   return (
//     console.log('MENU', res.body?.data?.menu?.items),
//     res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
//       title: item.title,
//       path: item.url.replace(domain, '').replace('/collections', '/search').replace('/pages', '')
//     })) || []
//   );
// }

// export async function getMenu(handle: string): Promise<Menu[]> {
//   const res = await shopifyFetch<ShopifyMenuOperation>({
//     query: getMenuQuery,
//     tags: [TAGS.collections],
//     variables: {
//       handle
//     }
//   });
//   console.log('MENU RES.BODY', JSON.stringify(res.body?.data?.menu, null, 2)); // Better structured logging
//   return (
//     res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
//             title: item.title,
//       path: item.url.replace(domain, '').replace('/collections', '/search').replace('/pages', '')
//   })) || []
//   );
// }

export async function getMenu(handle: string): Promise<Menu[]> {
   const res = await shopifyFetch<ShopifyMenuOperation>({
      query: getMenuQuery,
      tags: [TAGS.collections],
      variables: {
         handle
      }
   });

   // Function to recursively process menu items
   function processMenuItems(items: MenuItem[]): Menu[] {
      return items.map((item) => ({
         title: item.title,
         path: item.url.replace(domain, ''), // Simplified transformation
         url: item.url, // Add the 'url' property
         items: item.items ? processMenuItems(item.items) : undefined
      }));
   }

   // console.log('MENU RES.BODY', JSON.stringify(res.body?.data?.menu, null, 2));
   return res.body?.data?.menu?.items ? processMenuItems(res.body.data.menu.items) : [];
}

export async function getPage(handle: string): Promise<Page> {
   const res = await shopifyFetch<ShopifyPageOperation>({
      query: getPageQuery,
      cache: 'no-store',
      variables: { handle }
   });

   return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
   const res = await shopifyFetch<ShopifyPagesOperation>({
      query: getPagesQuery,
      cache: 'no-store'
   });

   return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
   const res = await shopifyFetch<ShopifyProductOperation>({
      query: getProductQuery,
      tags: [TAGS.products],
      variables: {
         handle
      }
   });

   return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
   const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
      query: getProductRecommendationsQuery,
      tags: [TAGS.products],
      variables: {
         productId
      }
   });

   return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
   query,
   reverse,
   sortKey
}: {
   query?: string;
   reverse?: boolean;
   sortKey?: string;
}): Promise<Product[]> {
   const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      tags: [TAGS.products],
      variables: {
         query,
         reverse,
         sortKey
      }
   });

   return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// New function that returns both products and pagination info.

export async function getProductsWithPagination({
   query,
   reverse,
   sortKey
}: {
   query?: string;
   reverse?: boolean;
   sortKey?: string;
}): Promise<{
   products: Product[];
   pageInfo: { endCursor: string | null; hasNextPage: boolean };
}> {
   // Here we explicitly tell TypeScript that our variables object is of type:
   const variables: { query?: string; reverse?: boolean; sortKey?: string } = {
      query,
      reverse,
      sortKey
   };

   // We also cast the response body once received.
   const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      tags: [TAGS.products],
      variables // ensure your shopifyFetch type allows a variables object of this shape
   });
   // Here we tell TypeScript that res.body is of type ShopifyProductsOperation.
   const body = res.body as ShopifyProductsOperation;

   const productsData = body.products;
   const products = reshapeProducts(removeEdgesAndNodes(productsData));
   const pageInfo = productsData.pageInfo;

   return { products, pageInfo };
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
   // We always need to respond with a 200 status code to Shopify,
   // otherwise it will continue to retry the request.
   const collectionWebhooks = ['collections/create', 'collections/delete', 'collections/update'];
   const productWebhooks = ['products/create', 'products/delete', 'products/update'];
   const topic = (await headers()).get('x-shopify-topic') || 'unknown';
   const secret = req.nextUrl.searchParams.get('secret');
   const isCollectionUpdate = collectionWebhooks.includes(topic);
   const isProductUpdate = productWebhooks.includes(topic);

   if (!secret || secret !== process.env.NEXT_PUBLIC_SHOPIFY_REVALIDATION_SECRET) {
      console.error('Invalid revalidation secret.');
      return NextResponse.json({ status: 401 });
   }

   if (!isCollectionUpdate && !isProductUpdate) {
      // We don't need to revalidate anything for any other topics.
      return NextResponse.json({ status: 200 });
   }

   if (isCollectionUpdate) {
      revalidateTag(TAGS.collections);
   }

   if (isProductUpdate) {
      revalidateTag(TAGS.products);
   }

   return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
