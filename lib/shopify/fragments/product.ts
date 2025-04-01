import imageFragment from './image';
import seoFragment from './seo';
import videoFragment from './video';

const productFragment = /* GraphQL */ `
   fragment product on Product {
      id
      handle
      availableForSale
      title
      description
      descriptionHtml
      options {
         id
         name
         values
      }
      priceRange {
         maxVariantPrice {
            amount
            currencyCode
         }
         minVariantPrice {
            amount
            currencyCode
         }
      }
      variants(first: 250) {
         edges {
            node {
               id
               sku
               title
               availableForSale
               selectedOptions {
                  name
                  value
               }
               price {
                  amount
                  currencyCode
               }
            }
         }
      }
      featuredImage {
         ...image
      }
      images(first: 20) {
         edges {
            node {
               ...image
            }
         }
      }
      media(first: 10) {
         edges {
            node {
               ... on Video {
                  ...video
               }
            }
         }
      }
      seo {
         ...seo
      }
      tags
      updatedAt
      metafield(namespace: "shopify", key: "color-pattern") {
         value
      }
      parentGroups: metafield(namespace: "custom", key: "parent_groups") {
         value
      }
      collections(first: 10) {
         nodes {
            id
            title
            handle
         }
      }
   }
   ${imageFragment}
   ${seoFragment}
   ${videoFragment}
`;

export default productFragment;
