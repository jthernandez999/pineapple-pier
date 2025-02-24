export type SortFilterItem = {
   title: string;
   slug: string | null;
   sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
   reverse: boolean;
};

export const defaultSort: SortFilterItem = {
   title: 'Relevance',
   slug: null,
   sortKey: 'RELEVANCE',
   reverse: false
};

export const sorting: SortFilterItem[] = [
   defaultSort,
   { title: 'Trending', slug: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false }, // asc
   { title: 'Latest arrivals', slug: 'latest-desc', sortKey: 'CREATED_AT', reverse: true },
   { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'PRICE', reverse: false }, // asc
   { title: 'Price: High to low', slug: 'price-desc', sortKey: 'PRICE', reverse: true }
];

export const TAGS = {
   collections: 'collections',
   products: 'products',
   cart: 'cart',
   customer: 'customer'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';
export const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2023-01/graphql.json';
export const SHOPIFY_USER_AGENT = 'DearJohnDenim Storefront/1.0 (https://dearjohndenim.co)';
export const SHOPIFY_ORIGIN = process.env.NEXT_PUBLIC_SHOPIFY_ORIGIN_URL;

// export const SHOPIFY_CUSTOMER_ACCOUNT_API_URL =
//    'https://dear-john-denim-headquarters.myshopify.com/authentication/10242207';
export const SHOPIFY_CUSTOMER_API_VERSION = '2025-01';
// New variable for the Customer Account API GraphQL endpoint:
export const SHOPIFY_CUSTOMER_GRAPHQL_ENDPOINT =
   process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_GRAPHQL_ENDPOINT;

export const SHOPIFY_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_SHOPIFY_GRAPHQL_ENDPOINT; // For Admin GraphQL if needed...

export const SHOPIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;

export const SHOPIFY_CUSTOMER_ACCOUNT_API_URL =
   process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
