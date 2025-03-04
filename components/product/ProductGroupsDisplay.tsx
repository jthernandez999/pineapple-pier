'use client';
import { ParentProduct, ProductGroupsDisplayProps } from 'lib/shopify/types';
import Image from 'next/image';
import React, { useState } from 'react';
import ProductGroupsDisplayLabel from './ProductGroupDisplayLabel';

const MAX_SWATCHES = 4;

const ProductGroupsDisplay: React.FC<ProductGroupsDisplayProps> = ({ groupTitle, products }) => {
   // Helper: extract price from product.
   const extractPrice = (product: ParentProduct): string => {
      if (product.price) return product.price;
      if (product.variants && product.variants.length > 0 && product.variants[0]?.priceV2) {
         return product.variants[0].priceV2.amount || '';
      }
      return '';
   };

   const initialImage =
      products[0]?.images[0]?.url ||
      'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110';
   const initialColorName =
      products[0]?.options?.find((option) => option.name.toLowerCase() === 'color')?.values[0] ||
      '';
   const initialPrice = products[0] ? extractPrice(products[0]) : '';

   const [mainImage, setMainImage] = useState(initialImage);
   const [selectedColorName, setSelectedColorName] = useState(initialColorName);
   const [selectedPrice, setSelectedPrice] = useState(initialPrice);
   const [lockedSelection, setLockedSelection] = useState<{
      image: string;
      color: string;
      price: string;
   } | null>(null);

   const updateSelection = (product: ParentProduct) => {
      const productImage =
         product.images[0]?.url ||
         'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110';
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : '';
      const priceValue = extractPrice(product);
      setMainImage(productImage);
      setSelectedColorName(colorValue || '');
      setSelectedPrice(priceValue);
   };

   const swatches = products.map((product) => {
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : undefined;

      let metaobjectId: string | null = null;
      if (product.metafields && product.metafields.length > 0) {
         const found = product.metafields.find((mf) => mf.key === 'color-pattern');
         if (found && found.value) {
            try {
               const metaobjectIds = JSON.parse(found.value);
               if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
                  metaobjectId = metaobjectIds[0];
               }
            } catch (error) {
               console.error('Error parsing metafield value:', error);
            }
         }
      }

      return (
         <button
            key={product.id}
            onMouseEnter={() => updateSelection(product)}
            onMouseLeave={() => {
               if (lockedSelection) {
                  setMainImage(lockedSelection.image);
                  setSelectedColorName(lockedSelection.color);
                  setSelectedPrice(lockedSelection.price);
               } else {
                  setMainImage(initialImage);
                  setSelectedColorName(initialColorName);
                  setSelectedPrice(initialPrice);
               }
            }}
            onClick={(e) => {
               e.stopPropagation();
               updateSelection(product);
               setLockedSelection({
                  image:
                     product.images[0]?.url ||
                     'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110',
                  color: colorValue as string,
                  price: extractPrice(product)
               });
            }}
            className="h-8 w-8 cursor-pointer rounded-full border border-gray-300"
            style={{ backgroundColor: colorValue }}
            title={colorValue}
         />
      );
   });

   return (
      <section className="my-12">
         <div className="mx-auto w-64 rounded-lg border p-4 transition-shadow hover:shadow-lg">
            <div className="flex flex-col">
               <div className="relative h-64 w-64">
                  <Image
                     src={mainImage}
                     alt={groupTitle}
                     fill
                     className="h-full w-full rounded object-cover"
                  />
               </div>
               <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{groupTitle}</h2>
                  <span className="text-lg text-gray-600">{selectedPrice}</span>
               </div>
               <div className="mt-1 text-left">
                  <p className="text-base text-gray-600">{selectedColorName}</p>
               </div>
               <div className="mt-4 flex gap-2">
                  {swatches.slice(0, MAX_SWATCHES)}
                  {swatches.length > MAX_SWATCHES && (
                     <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-700">
                        +{swatches.length - MAX_SWATCHES} more
                     </div>
                  )}
               </div>
            </div>
         </div>
         <ProductGroupsDisplayLabel
            title={groupTitle}
            amount={selectedPrice}
            currencyCode="USD"
            colorName={selectedColorName}
            metaobjectId={undefined}
            fallbackColor="#ccc"
            position="bottom"
         />
      </section>
   );
};

export default ProductGroupsDisplay;
