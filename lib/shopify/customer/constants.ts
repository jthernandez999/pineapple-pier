export const TAGS = {
   customer: 'customer'
};

//ENVs
// export const SHOPIFY_CUSTOMER_ACCOUNT_API_URL = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL || '';

export const SHOPIFY_USER_AGENT = '*';
export const SHOPIFY_ORIGIN = process.env.SHOPIFY_ORIGIN_URL || '';
export const SHOPIFY_ORIGIN_URL = process.env.NEXT_PUBLIC_SHOPIFY_ORIGIN_URL;
export const SHOPIFY_CUSTOMER_ACCOUNT_API_URL =
   process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
export const SHOPIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
export const SHOPIFY_CUSTOMER_API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_API_VERSION;
// And other constants as needed...

// lib/shopify/customer/constants.ts

// export const SHOPIFY_ORIGIN_URL = "https://dearjohndenim.co";
// export const SHOPIFY_CUSTOMER_API_VERSION = "2025-01";

// // This is used for authentication endpoints (e.g., token exchange)
// export const SHOPIFY_CUSTOMER_ACCOUNT_API_URL = "https://dear-john-denim-headquarters.myshopify.com/authentication/10242207";

// // This is your Customer Account API GraphQL endpoint. (Make sure this is the correct URL per Shopify’s docs.)
// export const SHOPIFY_CUSTOMER_GRAPHQL_ENDPOINT = "https://shopify.com/10242207/account/customer/api/2025-01/graphql";

// // Optionally, if you use the admin GraphQL endpoint:
// export const SHOPIFY_GRAPHQL_ENDPOINT = "https://dear-john-denim-headquarters.myshopify.com/api/2024-04/graphql.json";

// export const SHOPIFY_CLIENT_ID = "shp_a08be38e-bba2-4ea2-9904-7e3249cd894e";

// // Use a descriptive User-Agent for logging and debugging.
// export const SHOPIFY_USER_AGENT = "DearJohnDenim Storefront/1.0 (https://dearjohndenim.co)";

// // You can set the origin to your custom storefront domain.
// export const SHOPIFY_ORIGIN = SHOPIFY_ORIGIN_URL;

// // Any tags you use for caching or other logic.
// export const TAGS = {
//   customer: "customer"
// };
