import imageFragment from './image';
import seoFragment from './seo';

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
      seo {
         ...seo
      }
      tags
      updatedAt
      metafield(namespace: "shopify", key: "color-pattern") {
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
`;

export default productFragment;
