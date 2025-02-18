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
   return (
      <div
         className={clsx('mt-2 w-full', {
            'lg:px-20 lg:pb-[35%]': position === 'center'
         })}
      >
         <div className="rounded-md border bg-white/70 p-2 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
            {/* Title and Price in one row */}
            <div className="flex items-center justify-between">
               <h3 className="leading-none tracking-tight">{title}</h3>
               <Price
                  className="rounded-sm p-2 text-black"
                  amount={amount}
                  currencyCode={currencyCode}
                  currencyCodeClassName="hidden @[275px]/label:inline"
               />
            </div>
            {/* Selected Color Name */}
            {colorName && <div className="mt-1 text-sm">{colorName}</div>}
            {/* Color Swatch */}
            <div className="mt-1">
               {metaobjectId ? (
                  <ColorSwatch metaobjectId={metaobjectId} fallbackColor={fallbackColor} />
               ) : (
                  fallbackColor && (
                     <div
                        style={{
                           backgroundColor: fallbackColor,
                           width: '24px',
                           height: '24px',
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
