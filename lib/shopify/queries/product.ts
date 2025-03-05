import productFragment from '../fragments/product';

export const getProductQuery = /* GraphQL */ `
   query getProduct($handle: String!) {
      product(handle: $handle) {
         ...product
      }
   }
   ${productFragment}
`;

export const getProductsQuery = /* GraphQL */ `
   query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
      products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 100) {
         edges {
            node {
               ...product
            }
         }
         pageInfo {
            endCursor
            hasNextPage
         }
      }
   }
   ${productFragment}
`;

// export const getProductsQuery = /* GraphQL */ `
//   query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
//     products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 100) {
//       edges {
//         node {
//           ...product
//         }
//       }
//     }
//   }
//   ${productFragment}
// `;

export const getProductRecommendationsQuery = /* GraphQL */ `
   query getProductRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
         ...product
      }
   }
   ${productFragment}
`;

export const getProductGroups = /* GraphQL */ `
   query GetProductGroups($handle: String!, $type: String!) {
      metaobjectByHandle(handle: { handle: $handle, type: $type }) {
         id
         handle
         type
         fields {
            key
            value
         }
      }
   }
`;
