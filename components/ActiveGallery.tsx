'use client';

import { Gallery } from 'components/product/gallery';
import { useProduct } from 'components/product/product-context';
import type { Image } from 'lib/shopify/types';

export default function ActiveGallery() {
   const { activeProduct } = useProduct();

   const images =
      activeProduct.images && activeProduct.images.length > 0
         ? activeProduct.images.slice(0, 5).map((image: Image) => ({
              src: image.url,
              altText: image.altText
           }))
         : [
              {
                 src: 'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110',
                 altText: 'Default product image'
              }
           ];

   return <Gallery images={images} />;
}
