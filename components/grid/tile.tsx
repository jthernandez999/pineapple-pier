'use client';

import clsx from 'clsx';
import Image from 'next/image';
import React, { useState } from 'react';
import Label from '../label';

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
   // If hovered and secondarySrc exists, use it; otherwise, use the primary src.
   const displayedSrc = isHovered && secondarySrc ? secondarySrc : props.src;

   // Build an enhanced label by merging swatch properties.
   const enhancedLabel = label
      ? { ...label, metaobjectId: swatchMetaobjectId, fallbackColor: swatchFallbackColor }
      : undefined;

   return (
      <div
         className={clsx(
            // 'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black'
            // modern product card on collection page
            'group relative flex h-full w-full items-center justify-center overflow-hidden bg-white',
            {
               relative: label,
               'border-2 border-blue-600': active,
               'border-neutral-200 dark:border-neutral-800': !active
            }
         )}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         {displayedSrc ? (
            // The image is above the product label and swatch.
            <div className="relative h-full w-full overflow-hidden transition duration-300 ease-in-out group-hover:scale-105">
               <Image
                  className={clsx('h-full w-full object-contain', {
                     'transition duration-300 ease-in-out group-hover:scale-100': isInteractive
                  })}
                  {...props}
                  src={displayedSrc}
                  unoptimized
               />
            </div>
         ) : null}
         {enhancedLabel ? (
            <div className="">
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
         ) : null}
      </div>
   );
}
