'use client';
import React, { useState } from 'react';

type ParentProduct = {
   id: string;
   title: string;
   handle: string;
   // Optional top-level price (if available)
   price?: string;
   // If using variants, the price might be nested here.
   variants?: {
      edges: {
         node: {
            priceV2: {
               amount: string;
               currencyCode: string;
            };
         };
      }[];
   };
   options: { name: string; values: string[] }[];
   images: {
      edges: {
         node: {
            url: string;
         };
      }[];
   };
};

type ProductGroupsDisplayProps = {
   groupTitle: string;
   products: ParentProduct[];
   onClick?: () => void;
};

const ProductGroupsDisplay: React.FC<ProductGroupsDisplayProps> = ({
   groupTitle,
   products,
   onClick
}) => {
   // Function to extract the product price
   const extractPrice = (product: ParentProduct): string => {
      if (product.price) return product.price;
      if (product.variants && product.variants.edges.length > 0) {
         return product.variants?.edges[0]?.node?.priceV2?.amount || '';
      }
      return '';
   };

   // Set initial main image, color, and price from the first product
   const initialImage = products[0]?.images?.edges?.[0]?.node?.url || '/placeholder.png';
   const initialColorName =
      products[0]?.options?.find((option) => option.name.toLowerCase() === 'color')?.values[0] ||
      '';
   const initialPrice = products.length > 0 ? extractPrice(products[0]!) : '';

   const [mainImage, setMainImage] = useState(initialImage);
   const [selectedColorName, setSelectedColorName] = useState(initialColorName);
   const [selectedPrice, setSelectedPrice] = useState(initialPrice);

   return (
      <section className="my-12">
         <div
            className="w-64 cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-lg"
            onClick={onClick}
         >
            <div className="flex flex-col">
               {/* Main Image */}
               <div className="relative h-64 w-64">
                  <img
                     src={mainImage}
                     alt={groupTitle}
                     className="h-full w-full rounded object-cover"
                  />
               </div>
               {/* Row with Title on the left and Price on the right */}
               <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{groupTitle}</h2>
                  <span className="text-lg text-gray-600">{selectedPrice}</span>
               </div>
               {/* Selected color below (if desired) */}
               {selectedColorName && (
                  <p className="mt-1 text-base text-gray-500">{selectedColorName}</p>
               )}
               {/* Swatches Row */}
               <div className="mt-4 flex gap-2">
                  {products.map((product) => {
                     // Look for the color option for the product.
                     const colorOption = product.options.find(
                        (option) => option.name.toLowerCase() === 'color'
                     );
                     const colorValue = colorOption ? colorOption.values[0] : '';
                     return (
                        <div
                           key={product.id}
                           onMouseEnter={() => {
                              const productImage = product.images?.edges?.[0]?.node?.url;
                              if (productImage) {
                                 setMainImage(productImage);
                              }
                              if (colorValue) {
                                 setSelectedColorName(colorValue);
                              }
                              const price = extractPrice(product);
                              if (price) {
                                 setSelectedPrice(price);
                              }
                           }}
                           onMouseLeave={() => {
                              setMainImage(initialImage);
                              setSelectedColorName(initialColorName);
                              setSelectedPrice(initialPrice);
                           }}
                           className="h-8 w-8 cursor-pointer rounded-full border border-gray-300"
                           style={{ backgroundColor: colorValue }}
                           title={colorValue}
                        />
                     );
                  })}
               </div>
            </div>
         </div>
      </section>
   );
};

export default ProductGroupsDisplay;
