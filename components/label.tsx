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
   metaobjectId?: string;
   metaobjectIdsArray?: string[];
   fallbackColor?: string;
   position?: 'bottom' | 'center';
   swatchMetaobjectId?: string;
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
         <div className="text-md black mt-0 border-x-[0.5px] border-b-[0.5px] p-2 font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
            <div className="mb-0 mt-0 flex items-center justify-between pb-0 pt-0 font-normal">
               <h5 className="text-xs font-light leading-none tracking-tight">
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
                           <span className="text-xs font-semibold uppercase tracking-wide">
                              {firstWord}
                           </span>{' '}
                           <span className="text-xs font-light leading-none tracking-normal">
                              {restOfTitle}
                           </span>
                        </>
                     );
                  })()}
               </h5>
               <Price
                  className="text-xs text-black md:text-sm"
                  amount={amount}
                  currencyCode={currencyCode}
                  currencyCodeClassName="hidden @[275px]/label:inline"
               />
            </div>
            {colorName && (
               <div className="mb-2 mt-0 pt-0 text-[.70rem] font-normal tracking-normal">
                  {colorName}
               </div>
            )}
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
                           border:
                              id === metaobjectId
                                 ? '2px solid'
                                 : '1px solid rgba(255,255,255,0.25)',
                           borderRadius: '50%',
                           boxShadow:
                              id === metaobjectId ? '0 0 10px rgba(191,166,116,0.7)' : 'none',
                           transform: id === metaobjectId ? 'scale(1.05)' : 'scale(1)',
                           background:
                              id === metaobjectId
                                 ? 'linear-gradient(135deg, #ffffff, #f5f3e3)'
                                 : '#f8f7f4'
                        }}
                        title={id}
                     >
                        <ColorSwatch metaobjectId={id} fallbackColor={fallbackColor} />
                     </div>
                  ))}
               </div>
            ) : (
               metaobjectId && (
                  <div className="mt-2">
                     <ColorSwatch
                        metaobjectId={metaobjectId}
                        metaobjectIdsArray={metaobjectIdsArray?.filter(Boolean)}
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
