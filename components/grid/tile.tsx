'use client';
import clsx from 'clsx';
import Image from 'next/image';
import React, { useState } from 'react';
import Label from '../label';

const fallbackImg =
   'https://cdn.shopify.com/s/files/1/1024/2207/files/default_logo_dear_john_denim.jpg?v=1739228110';
export function GridTileImage({
   isInteractive = true,
   active,
   label,
   secondarySrc, // Optional prop for the second image
   swatchMetaobjectId, // Metaobject ID for the color swatch
   swatchFallbackColor, // Fallback color if metaobject fetch fails
   ...props
}: {
   isInteractive?: boolean;
   active?: boolean;
   label?: {
      title: string;
      amount: string;
      currencyCode: string;
      position?: 'bottom' | 'center';
      colorName?: string; // Optional: if you want to pass a static color name.
   };
   secondarySrc?: string;
   swatchMetaobjectId?: string;
   swatchFallbackColor?: string;
} & React.ComponentProps<typeof Image>) {
   // Local state to track hover.
   const [isHovered, setIsHovered] = useState(false);
   // Use secondarySrc on hover if provided.
   const displayedSrc = isHovered && secondarySrc ? secondarySrc : props.src;

   // Build an enhanced label by merging swatch properties.
   const enhancedLabel = label
      ? { ...label, metaobjectId: swatchMetaobjectId, fallbackColor: swatchFallbackColor }
      : undefined;
   const srcToUse = displayedSrc || fallbackImg;
   return (
      <div
         className={clsx(
            // Removed h-full so that on mobile the container doesn't force excessive height.
            'group relative flex w-full flex-col overflow-hidden bg-white',
            {
               'border-2 border-blue-600': active,
               'border-neutral-200 dark:border-neutral-800': !active
            }
         )}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         {/* Image container with fixed 2/3 aspect ratio */}
         {displayedSrc && (
            <div className="relative aspect-[2/3] w-full overflow-hidden transition duration-300 ease-in-out group-hover:scale-105">
               <Image
                  className={clsx('w-full object-cover', {
                     'transition duration-300 ease-in-out group-hover:scale-100': isInteractive
                  })}
                  {...props}
                  src={srcToUse}
                  unoptimized
               />
            </div>
         )}
         {/* Label rendered below the image */}
         {enhancedLabel && (
            <div className="mt-2 w-full">
               <Label
                  title={enhancedLabel.title}
                  amount={enhancedLabel.amount}
                  currencyCode={enhancedLabel.currencyCode}
                  position={enhancedLabel.position}
                  colorName={enhancedLabel.colorName}
                  metaobjectId={enhancedLabel.metaobjectId}
                  fallbackColor={enhancedLabel.fallbackColor}
               />
            </div>
         )}
      </div>
   );
}
