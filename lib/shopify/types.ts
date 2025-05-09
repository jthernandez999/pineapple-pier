export type Maybe<T> = T | null;

export type Connection<T> = {
   edges: Array<Edge<T>>;
};

export type Edge<T> = {
   node: T;
};

export type CartProduct = {
   id: string;
   handle: string;
   title: string;
   featuredImage: Image;
};

export type CartItem = {
   id: string | undefined;
   quantity: number;
   cost: {
      totalAmount: Money;
   };
   merchandise: {
      id: string;
      title: string;
      selectedOptions: {
         name: string;
         value: string;
      }[];
      product: CartProduct;
   };
};

export type Collection = ShopifyCollection & {
   path: string;
};

export type Image = {
   url: string;
   altText: string;
   width: number;
   height: number;
   // edges?: any;
};

export type Cart = Omit<ShopifyCart, 'lines'> & {
   lines: CartItem[];
};
// export type Menu = { original
//   title: string;
//   path: string;
// };

// export type Menu = { 2nd iteration
//   title: string;
//   path: string;
//   items?: Menu[];
// };

export type Menu = {
   path: string;
   title: string;
   url: string;
   items?: Menu[];
};

export type MenuItem = {
   title: string;
   url: string;
   items?: MenuItem[];
};

export type Money = {
   amount: string;
   currencyCode: string;
};

export type Page = {
   id: string;
   title: string;
   handle: string;
   body: string;
   bodySummary: string;
   seo?: SEO;
   createdAt: string;
   updatedAt: string;
};

export type Metafield = {
   find?: any;
   length?: number;
   key: string;
   value: string;
};
export type Video = {
   id: string;
   sources: {
      url: string;
      format: string;
      mimeType: string;
   }[];
   alt?: string;
};

export type Product = Omit<ShopifyProduct, 'variants' | 'images'> & {
   variants: ProductVariant[];
   images: Image[];
   media?: {
      edges: Array<{
         node: Video;
      }>;
   };
   options?: { name: string; values: string[] }[];
   spec?: {
      Material?: string;
      'Front Rise'?: string;
      'Leg Opening'?: string;
      Inseam?: string;
   };
   metafields?: Metafield[] | Metafield;
   metafield?: Metafield[] | Metafield;
   price?: string;
   collectionHandle?: string;
   collections?: {
      nodes: Collection[];
   };
};
export type ProductPageProps = {
   params: {
      handle: string;
      collection?: string;
   };
};

export type ProductOption = {
   id: string;
   name: string;
   values: string[];
};

export type ProductVariant = {
   metafield?: any;
   spec: string;
   id: string;
   title: string;
   availableForSale: boolean;
   selectedOptions: {
      name: string;
      value: string;
   }[];
   price: Money;
   priceV2?: {
      amount: string;
      currencyCode: string;
   };
};

export type SEO = {
   title: string;
   description: string;
};

export type ShopifyCart = {
   id: string | undefined;
   checkoutUrl: string;
   cost: {
      subtotalAmount: Money;
      totalAmount: Money;
      totalTaxAmount: Money;
   };
   lines: Connection<CartItem>;
   totalQuantity: number;
};

export type ShopifyCollection = {
   id?: string;
   handle: string;
   title: string;
   description: string;
   seo: SEO;
   updatedAt: string;
};

export type ShopifyProduct = {
   id: string;
   handle: string;
   availableForSale: boolean;
   title: string;
   description: string;
   descriptionHtml: string;
   options: ProductOption[];
   priceRange: {
      maxVariantPrice: Money;
      minVariantPrice: Money;
   };
   variants: Connection<ProductVariant>;
   featuredImage: Image;
   images: Connection<Image>;
   seo: SEO;
   tags: string[];
   updatedAt: string;
   metafields?: Metafield[];
   metafield?: Metafield[];
   edges?: { node: any }[];
   pageInfo?: { endCursor: string; hasNextPage: boolean };
};

// export interface ShopifyProductConnection {
//    edges: {
//       node: ShopifyProduct;
//    }[];
//    pageInfo: {
//       hasNextPage: boolean;
//       endCursor: string | null;
//    };
// }

export type ProductGroup = {
   id: string;
   title: string;
   products: Product[];
};

export type ProductGroupsResponse = {
   groups: ProductGroup[];
};

export type ShopifyCartOperation = {
   data: {
      cart: ShopifyCart;
   };
   variables: {
      cartId: string;
   };
};

export type ShopifyCreateCartOperation = {
   data: { cartCreate: { cart: ShopifyCart } };
};

export type ShopifyAddToCartOperation = {
   data: {
      cartLinesAdd: {
         cart: ShopifyCart;
      };
   };
   variables: {
      cartId: string;
      lines: {
         merchandiseId: string;
         quantity: number;
      }[];
   };
};

export type ShopifyRemoveFromCartOperation = {
   data: {
      cartLinesRemove: {
         cart: ShopifyCart;
      };
   };
   variables: {
      cartId: string;
      lineIds: string[];
   };
};

export type ShopifyUpdateCartOperation = {
   data: {
      cartLinesUpdate: {
         cart: ShopifyCart;
      };
   };
   variables: {
      cartId: string;
      lines: {
         id: string;
         merchandiseId: string;
         quantity: number;
      }[];
   };
};

export type ShopifyCollectionOperation = {
   data: {
      collection: ShopifyCollection;
   };
   variables: {
      handle: string;
   };
};

export type ShopifyCollectionProductsOperation = {
   data: {
      product?: ShopifyProduct;
      collection: {
         products: Connection<ShopifyProduct>;
      };
      products?: Connection<ShopifyProduct>;
   };

   variables: {
      handle: string;
      reverse?: boolean;
      sortKey?: string;
   };
};

export type ShopifyCollectionsOperation = {
   data: {
      collections: Connection<ShopifyCollection>;
   };
};

export type ShopifyMenuOperation = {
   data: {
      menu?: {
         items: {
            title: string;
            url: string;
         }[];
      };
   };
   variables: {
      handle: string;
   };
};

export type ShopifyPageOperation = {
   data: { pageByHandle: Page };
   variables: { handle: string };
};

export type ShopifyPagesOperation = {
   data: {
      pages: Connection<Page>;
   };
};

export type ShopifyProductOperation = {
   data: { product: ShopifyProduct };
   variables: {
      handle: string;
   };
};

export type ShopifyProductRecommendationsOperation = {
   data: {
      productRecommendations: ShopifyProduct[];
   };
   variables: {
      productId: string;
   };
};

export type ShopifyProductsOperation = {
   products: any;
   data: {
      products: Connection<ShopifyProduct>;
   };
   variables: {
      query?: string;
      reverse?: boolean;
      sortKey?: string;
   };
};

export type ParentProduct = Omit<ShopifyProduct, 'variants' | 'images'> & {
   variants: ProductVariant[]; // flat array
   images: Image[]; // flat array
   options?: { name: string; values: string[] }[];
   metafields?: Metafield[];
   price?: string; // Optional top-level price field if available
};

// export type ParentProduct = {
//    id: string;
//    title: string;
//    handle: string;
//    // Price can be a top-level field or come from the first variant:
//    price?: string;
//    variants?: {
//       edges: {
//          node: {
//             priceV2: {
//                amount: string;
//                currencyCode: string;
//             };
//          };
//       }[];
//    };
//    options: { name: string; values: string[] }[];
//    images: {
//       edges: {
//          node: {
//             url: string;
//          };
//       }[];
//    };
// };

export interface ProductGroupsDisplayProps {
   groupTitle: string;
   products: Product[];
}

export interface CarouselProps {
   products: Product[];
}
