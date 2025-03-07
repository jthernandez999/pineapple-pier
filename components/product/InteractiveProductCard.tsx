'use client';
import { ColorSwatch } from 'components/ColorSwatch';
import { GridTileImage } from 'components/grid/tile';
import Label from 'components/label';
import { getColorPatternMetaobjectId } from 'lib/helpers/metafieldHelpers';
import { ParentProduct } from 'lib/shopify/types';
import React, { useState } from 'react';

interface InteractiveProductCardProps {
   groupTitle: string;
   products: ParentProduct[];
}

const MAX_SWATCHES = 4;

const InteractiveProductCard: React.FC<InteractiveProductCardProps> = ({
   groupTitle,
   products
}) => {
   if (products.length === 0) return null;

   // Extract a valid price string from a product.
   const extractPrice = (product: ParentProduct): string => {
      if (product.price && !isNaN(parseFloat(product.price))) {
         return parseFloat(product.price).toFixed(2);
      }
      if (
         product.variants &&
         product.variants.length > 0 &&
         product.variants[0]?.priceV2 &&
         product.variants[0].priceV2.amount
      ) {
         const amount = parseFloat(product.variants[0].priceV2.amount);
         return isNaN(amount) ? '' : amount.toFixed(2);
      }
      return '';
   };

   const defaultImage =
      'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110';

   // Use the first product's data as initial state.
   const initialImage = products[0]!.images[0]?.url || defaultImage;
   const initialColorName =
      products[0]!.options?.find((option) => option.name.toLowerCase() === 'color')?.values[0] ||
      '';
   const initialPrice = extractPrice(products[0]!);

   const [mainImage, setMainImage] = useState<string>(initialImage);
   const [selectedColorName, setSelectedColorName] = useState<string>(initialColorName);
   const [selectedPrice, setSelectedPrice] = useState<string>(initialPrice);
   const [lockedSelection, setLockedSelection] = useState<{
      image: string;
      color: string;
      price: string;
   } | null>(null);

   const updateSelection = (product: ParentProduct) => {
      const productImage = product.images[0]?.url || defaultImage;
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] || '' : '';
      const priceValue = extractPrice(product);
      setMainImage(productImage);
      setSelectedColorName(colorValue);
      setSelectedPrice(priceValue);
   };

   // Build swatches for every product in the group.
   const swatches = products.map((product) => {
      const colorOption = product.options?.find((option) => option.name.toLowerCase() === 'color');
      const colorValue = colorOption ? colorOption.values[0] || '' : '';
      const metaobjectId = getColorPatternMetaobjectId(product);
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
                  image: product.images[0]?.url || defaultImage,
                  color: colorValue,
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
                  <GridTileImage
                     src={mainImage}
                     alt={groupTitle}
                     fill
                     className="rounded object-cover"
                  />
               </div>
               <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{groupTitle}</h2>
                  <span className="text-lg text-gray-600">
                     {selectedPrice ? `$${selectedPrice}` : ''}
                  </span>
               </div>
               <div className="mt-1 text-left">
                  <p className="text-base text-gray-600">{selectedColorName || '-'}</p>
               </div>
               {/* Container for all swatches; using flex-wrap to show multiple */}
               <div className="mt-4 flex flex-wrap gap-2">{swatches}</div>
            </div>
         </div>
         <Label
            title={groupTitle}
            amount={selectedPrice ? `$${selectedPrice}` : ''}
            currencyCode={products[0]!.priceRange?.maxVariantPrice?.currencyCode || ''}
            colorName={selectedColorName}
            displaySwatch={false}
            fallbackColor="#ccc"
            position="bottom"
         />
      </section>
   );
};

export default InteractiveProductCard;
