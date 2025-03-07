'use client';
import clsx from 'clsx';
import React from 'react';
import { ColorSwatch } from './ColorSwatch';
import Price from './price';

interface LabelProps {
   title: string;
   amount: string;
   currencyCode: string;
   colorName?: string;
   metaobjectId?: string; // currently active metaobject id
   metaobjectIdsArray?: string[]; // array of metaobject ids for the group (should be unique)
   fallbackColor?: string; // fallback color code
   position?: 'bottom' | 'center';
   swatchMetaobjectId?: string; // for compatibility with GridTileImage
   onSwatchClick?: (swatchId: string, e: React.MouseEvent<HTMLDivElement>) => void;
}

const Label: React.FC<LabelProps> = ({
   title,
   amount,
   currencyCode,
   colorName,
   metaobjectId,
   fallbackColor = '#ccc',
   position = 'bottom',
   metaobjectIdsArray,
   onSwatchClick
}) => {
   const filteredTitle = colorName
      ? title.replace(new RegExp(`\\b${colorName}\\b`, 'i'), '').trim()
      : title;

   return (
      <div
         className={clsx('mt-0 w-full', {
            'lg:px-20 lg:pb-[35%]': position === 'center'
         })}
      >
         <div className="text-md black mt-0 border-x-[0.5px] border-b-[0.5px] bg-white/70 p-2 font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
            {/* Title and Price */}
            <div className="mb-0 mt-0 flex items-center justify-between pb-0 pt-0 font-normal">
               <h3 className="text-xs font-light leading-none tracking-tight md:text-sm">
                  {(() => {
                     if (filteredTitle.startsWith('North Hampton')) {
                        return (
                           <>
                              <span className="font-semibold uppercase">North Hampton</span>{' '}
                              {filteredTitle.replace('North Hampton', '').trim()}
                           </>
                        );
                     }
                     if (filteredTitle.startsWith('South Hampton')) {
                        return (
                           <>
                              <span className="font-semibold uppercase">South Hampton</span>{' '}
                              {filteredTitle.replace('South Hampton', '').trim()}
                           </>
                        );
                     }
                     const words = filteredTitle.split(' ');
                     const firstWord = words[0];
                     const restOfTitle = words.slice(1).join(' ');
                     return (
                        <>
                           <span className="font-semibold uppercase">{firstWord}</span>{' '}
                           {restOfTitle}
                        </>
                     );
                  })()}
               </h3>
               <Price
                  className="text-xs text-black md:text-sm"
                  amount={amount}
                  currencyCode={currencyCode}
                  currencyCodeClassName="hidden @[275px]/label:inline"
               />
            </div>

            {/* Selected Color Name */}
            {colorName && <div className="mb-2 mt-0 pt-0 text-xs font-normal">{colorName}</div>}

            {/* If there are multiple swatches, render one set */}
            {metaobjectIdsArray && metaobjectIdsArray.length > 1 ? (
               <div className="mt-2 flex gap-2">
                  {metaobjectIdsArray.map((id) => (
                     <div
                        key={id}
                        className="cursor-pointer"
                        onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           if (onSwatchClick) onSwatchClick(id, e);
                        }}
                        style={{
                           // Optionally, you can style the active swatch differently:
                           // border: id === metaobjectId ? '2px solid black' : '1px solid #ccc',
                           borderRadius: '50%'
                        }}
                        title={id}
                     >
                        <ColorSwatch
                           metaobjectId={id}
                           // Do not pass metaobjectIdsArray here so that only one swatch is rendered per id.
                           fallbackColor={fallbackColor}
                        />
                     </div>
                  ))}
               </div>
            ) : (
               // If only one swatch is available, render it directly.
               metaobjectId && (
                  <div className="mt-2">
                     <ColorSwatch
                        metaobjectId={metaobjectId}
                        metaobjectIdsArray={metaobjectIdsArray}
                        fallbackColor={fallbackColor}
                     />
                  </div>
               )
            )}
         </div>
      </div>
   );
};

export default Label;
