'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { ParentProduct, ProductGroupsDisplayProps } from '../../lib/shopify/types';

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

   // Initial selection from the first product.
   const initialImage = products[0]?.images[0]?.url || '/placeholder.png';
   const initialColorName =
      products[0]?.options?.find((option) => option.name.toLowerCase() === 'color')?.values[0] ||
      '';
   const initialPrice = products[0] ? extractPrice(products[0]) : '';

   // Main display states.
   const [mainImage, setMainImage] = useState(initialImage);
   const [selectedColorName, setSelectedColorName] = useState(initialColorName);
   const [selectedPrice, setSelectedPrice] = useState(initialPrice);
   // When a swatch is clicked, lock its selection.
   const [lockedSelection, setLockedSelection] = useState<{
      image: string;
      color: string;
      price: string;
   } | null>(null);

   // Function to update the display state from a given product.
   const updateSelection = (product: ParentProduct) => {
      const productImage = product.images[0]?.url || '/placeholder.png';
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : '';
      const priceValue = extractPrice(product);
      setMainImage(productImage);
      setSelectedColorName(colorValue || '');
      setSelectedPrice(priceValue);
   };

   // Build swatches for color options.
   const swatches = products.map((product) => {
      // Extract the first color option value for this product.
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : undefined;

      return (
         <div
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
               e.stopPropagation(); // Prevent parent onClick if any.
               updateSelection(product);
               setLockedSelection({
                  image: product.images[0]?.url || '/placeholder.png',
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
               {/* Main Image */}
               <div className="relative h-64 w-64">
                  <Image
                     src={mainImage}
                     alt={groupTitle}
                     fill
                     className="h-full w-full rounded object-cover"
                  />
               </div>
               {/* Title & Price Row */}
               <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{groupTitle}</h2>
                  <span className="text-lg text-gray-600">{selectedPrice}</span>
               </div>
               {/* Selected Color Name */}
               <div className="mt-1 text-left">
                  <p className="text-base text-gray-600">{selectedColorName}</p>
               </div>
               {/* Swatches Row */}
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
      </section>
   );
};

export default ProductGroupsDisplay;
