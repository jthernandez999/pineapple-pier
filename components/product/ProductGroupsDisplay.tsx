'use client';
import { ColorSwatch } from 'components/ColorSwatch';
import { getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { ParentProduct } from 'lib/shopify/types';
import Image from 'next/image';
import React, { useState } from 'react';
import ProductGroupsDisplayLabel from '../../components/product/ProductGroupDisplayLabel';

interface ProductGroupsDisplayProps {
   groupTitle: string;
   products: ParentProduct[];
   price?: string;
}

const MAX_SWATCHES = 4;

const ProductGroupsDisplay: React.FC<ProductGroupsDisplayProps> = ({
   groupTitle,
   products,
   price
}) => {
   // Helper to extract price (simplified)
   const extractPrice = (product: ParentProduct): string => {
      if (product.price && !isNaN(Number(product.price))) return product.price;
      if (product.variants && product.variants.length > 0 && product.variants[0]?.priceV2) {
         const amount = Number(product.variants[0].priceV2.amount);
         return isNaN(amount) ? '' : amount.toFixed(2);
      }
      return '';
   };

   const defaultImage =
      'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110';

   // Use the first product's image as initial image
   const initialImage = products[0]?.images[0]?.url || defaultImage;
   // Use the first product's color value (if available) as initial color
   const initialColorName =
      products[0]?.options?.find((option) => option.name.toLowerCase() === 'color')?.values[0] ||
      '';
   // Use the passed-in price if available; otherwise, compute from the first product.
   const initialPrice = price ?? (products[0] ? extractPrice(products[0]) : '');

   const [mainImage, setMainImage] = useState(initialImage);
   const [selectedColorName, setSelectedColorName] = useState(initialColorName);
   const [selectedPrice, setSelectedPrice] = useState(initialPrice);
   const [lockedSelection, setLockedSelection] = useState<{
      image: string;
      color: string;
      price: string;
   } | null>(null);

   const updateSelection = (product: ParentProduct) => {
      const productImage = product.images[0]?.url || defaultImage;
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : '';
      const priceValue = extractPrice(product);
      setMainImage(productImage);
      setSelectedColorName(colorValue || '');
      setSelectedPrice(priceValue);
   };

   // Generate swatches from all products in this group.
   const swatches = products.map((product) => {
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] : undefined;
      // Get the color-pattern metaobject ID (if available)
      const metaobjectId = getColorPatternMetaobjectId(product);
      return (
         <button
            key={product.id}
            onMouseEnter={() => updateSelection(product)}
            onMouseLeave={() => {
               // Restore locked selection if set, otherwise revert to initial values.
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
                  image: product.images[0]?.url || defaultImage,
                  color: (colorValue as string) || '',
                  price: extractPrice(product)
               });
            }}
            className="h-8 w-8 cursor-pointer rounded-full border border-gray-300"
            style={{ backgroundColor: colorValue }}
            title={colorValue}
         >
            {metaobjectId ? (
               <ColorSwatch metaobjectId={metaobjectId} fallbackColor={colorValue || '#ccc'} />
            ) : (
               <div
                  style={{
                     backgroundColor: colorValue || '#ccc',
                     width: '100%',
                     height: '100%',
                     borderRadius: '50%'
                  }}
               />
            )}
         </button>
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
            metaobjectId={getColorPatternMetaobjectId(products[0])} // use first product's swatch ID
            fallbackColor="#ccc"
            position="bottom"
         />
      </section>
   );
};

export default ProductGroupsDisplay;
