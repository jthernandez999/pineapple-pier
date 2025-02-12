'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useState } from 'react';
import Label from '../label';

export function GridTileImage({
   isInteractive = true,
   active,
   label,
   secondarySrc, // New optional prop for the second image
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
} & React.ComponentProps<typeof Image>) {
   // Local state to track whether the tile is hovered.
   const [isHovered, setIsHovered] = useState(false);
   // Display secondarySrc if hovered and it exists; otherwise use the primary src.
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
      </div>
   );
}

// import clsx from 'clsx';
// import Image from 'next/image';
// import Label from '../label';

// export function GridTileImage({
//   isInteractive = true,
//   active,
//   label,
//   ...props
// }: {
//   isInteractive?: boolean;
//   active?: boolean;
//   label?: {
//     title: string;
//     amount: string;
//     currencyCode: string;
//     position?: 'bottom' | 'center';
//   };
// } & React.ComponentProps<typeof Image>) {
//   return (
//     <div
//       className={clsx(
//         'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
//         {
//           relative: label,
//           'border-2 border-blue-600': active,
//           'border-neutral-200 dark:border-neutral-800': !active
//         }
//       )}
//     >
//       {props.src ? (
//         <Image
//           className={clsx('relative h-full w-full object-contain', {
//             'transition duration-300 ease-in-out group-hover:scale-105': isInteractive
//           })}
//           {...props}
//         />
//       ) : null}
//       {label ? (
//         <Label
//           title={label.title}
//           amount={label.amount}
//           currencyCode={label.currencyCode}
//           position={label.position}
//         />
//       ) : null}
//     </div>
//   );
// }
