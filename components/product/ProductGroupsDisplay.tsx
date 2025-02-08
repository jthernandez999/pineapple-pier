'use client';
import React, { useState } from 'react';

type ParentProduct = {
   id: string;
   title: string;
   handle: string;
   // Price can be a top-level field or come from the first variant:
   price?: string;
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
   // Helper: extract price from product
   const extractPrice = (product: ParentProduct): string => {
      if (product.price) return product.price;
      if (product.variants && product.variants.edges.length > 0) {
         return product.variants.edges[0].node.priceV2.amount;
      }
      return '';
   };

   // Initial selection from the first product
   const initialImage = products[0]?.images?.edges?.[0]?.node?.url || '/placeholder.png';
   const initialColorName =
      products[0]?.options?.find((option) => option.name.toLowerCase() === 'color')?.values[0] ||
      '';
   const initialPrice = extractPrice(products[0]);

   // Main display states
   const [mainImage, setMainImage] = useState(initialImage);
   const [selectedColorName, setSelectedColorName] = useState(initialColorName);
   const [selectedPrice, setSelectedPrice] = useState(initialPrice);
   // When a swatch is clicked, lock its selection
   const [lockedSelection, setLockedSelection] = useState<{
      image: string;
      color: string;
      price: string;
   } | null>(null);

   // Function to update the display state from a given product
   const updateSelection = (product: ParentProduct) => {
      const productImage = product.images?.edges?.[0]?.node?.url || '/placeholder.png';
      const colorOption = product.options.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : '';
      const priceValue = extractPrice(product);
      setMainImage(productImage);
      setSelectedColorName(colorValue);
      setSelectedPrice(priceValue);
   };

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
                  {products.map((product) => {
                     const colorOption = product.options.find(
                        (option) => option.name.toLowerCase() === 'color'
                     );
                     const colorValue = colorOption ? colorOption.values[0] : '';
                     return (
                        <div
                           key={product.id}
                           onMouseEnter={() => {
                              // Only preview if no locked selection exists or we want to preview over locked selection
                              updateSelection(product);
                           }}
                           onMouseLeave={() => {
                              // On mouse leave, if a swatch is locked, revert to its values; otherwise revert to initial.
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
                              e.stopPropagation(); // Prevent parent onClick
                              updateSelection(product);
                              setLockedSelection({
                                 image: product.images?.edges?.[0]?.node?.url || '/placeholder.png',
                                 color: colorValue,
                                 price: extractPrice(product)
                              });
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
