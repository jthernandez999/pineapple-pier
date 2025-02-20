import clsx from 'clsx';
import React from 'react';
import { ColorSwatch } from './ColorSwatch';
import Price from './price';

interface LabelProps {
   title: string;
   amount: string;
   currencyCode: string;
   colorName?: string;
   metaobjectId?: string; // dynamic metaobject id
   fallbackColor?: string; // fallback color code
   position?: 'bottom' | 'center';
}

const Label: React.FC<LabelProps> = ({
   title,
   amount,
   currencyCode,
   colorName,
   metaobjectId,
   fallbackColor = '#ccc',
   position = 'bottom'
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
         <div className="text-md mt-0 rounded-sm border bg-white/70 p-2 pt-0 font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
            {/* Title and Price in one row */}
            <div className="mb-0 mt-0 flex items-center justify-between pb-0 pt-0 font-normal">
               <h3 className="text-sm leading-none tracking-tight">{filteredTitle}</h3>
               <Price
                  className="rounded-sm p-0 text-black"
                  amount={amount}
                  currencyCode={currencyCode}
                  currencyCodeClassName="hidden @[275px]/label:inline"
               />
            </div>
            {/* Selected Color Name */}
            {colorName && <div className="mb-2 mt-0 pt-0 text-xs font-normal">{colorName}</div>}
            {/* Color Swatch */}
            <div className="mt-0">
               {metaobjectId ? (
                  <ColorSwatch metaobjectId={metaobjectId} fallbackColor={fallbackColor} />
               ) : (
                  fallbackColor && (
                     <div
                        style={{
                           backgroundColor: fallbackColor,
                           width: '20px',
                           height: '20px',
                           borderRadius: '50%',
                           border: '1px solid #ccc'
                        }}
                        title={fallbackColor}
                     />
                  )
               )}
            </div>
         </div>
      </div>
   );
};

export default Label;
