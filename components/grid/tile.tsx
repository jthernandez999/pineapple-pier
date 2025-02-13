'use client';

import clsx from 'clsx';
import Image from 'next/image';
import React, { useState } from 'react';
import { ColorSwatch } from '../ColorSwatch';
import Label from '../label';

export function GridTileImage({
   isInteractive = true,
   active,
   label,
   secondarySrc, // Optional prop for the second image
   swatchMetaobjectId, // New: metaobject ID for the color swatch
   swatchFallbackColor, // New: fallback color if metaobject fetch fails
   ...props
}: {
   isInteractive?: boolean;
   active?: boolean;
   label?: {
      title: string;
      amount: string;
      currencyCode: string;
      position?: 'bottom' | 'center';
   };
   secondarySrc?: string;
   swatchMetaobjectId?: string;
   swatchFallbackColor?: string;
} & React.ComponentProps<typeof Image>) {
   // Local state to track hover.
   const [isHovered, setIsHovered] = useState(false);
   // If hovered and secondarySrc exists, use it; otherwise use the primary src.
   const displayedSrc = isHovered && secondarySrc ? secondarySrc : props.src;

   return (
      <div
         className={clsx(
            'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
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
            <Image
               className={clsx('relative h-full w-full object-contain', {
                  'transition duration-300 ease-in-out group-hover:scale-105': isInteractive
               })}
               {...props}
               src={displayedSrc}
               unoptimized
            />
         ) : null}
         {label ? (
            <Label
               title={label.title}
               amount={label.amount}
               currencyCode={label.currencyCode}
               position={label.position}
            />
         ) : null}
         {/* Render ColorSwatch overlay if swatchMetaobjectId is provided */}
         {swatchMetaobjectId && (
            <div className="absolute bottom-2 left-2 h-6 w-6">
               <ColorSwatch
                  metaobjectId={swatchMetaobjectId}
                  fallbackColor={swatchFallbackColor || '#ccc'}
               />
            </div>
         )}
      </div>
   );
}
