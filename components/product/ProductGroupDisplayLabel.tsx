import clsx from 'clsx';
import React from 'react';
import { ColorSwatch } from '../ColorSwatch';
import Price from '../price';

interface LabelProps {
   title: string;
   amount: string;
   currencyCode: string;
   colorName?: string; // e.g. "Multi Print"
   metaobjectId?: string; // metaobject ID to fetch swatch color, if available
   fallbackColor?: string; // fallback color if metaobject fetch fails
   position?: 'bottom' | 'center';
   swatchMetaobjectId?: string; // added for compatibility with GridTileImage
}

const ProductGroupsDisplayLabel: React.FC<LabelProps> = ({
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
         className={clsx('absolute bottom-0 left-0 w-full px-4 pb-4 @container/label', {
            'lg:px-20 lg:pb-[35%]': position === 'center'
         })}
      >
         <div className="flex flex-col rounded-md border bg-white/70 p-1 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
            {/* Row 1: Title & Price */}
            <div className="flex items-center justify-between">
               <h3 className="line-clamp-2 flex-grow pl-2 leading-none tracking-tight">{title}</h3>
               <Price
                  className="flex-none rounded-sm p-2 text-black"
                  amount={amount}
                  currencyCode={currencyCode}
                  currencyCodeClassName="hidden @[275px]/label:inline"
               />
            </div>
            {/* Row 2: Color Name */}
            {colorName && (
               <div className="mt-1 flex items-center">
                  <span>{colorName}</span>
               </div>
            )}
            {/* Row 3: Color Swatch using ColorSwatch component */}
            {metaobjectId ? (
               <div className="mt-1">
                  <ColorSwatch metaobjectId={metaobjectId} fallbackColor={fallbackColor} />
               </div>
            ) : (
               fallbackColor && (
                  <div className="mt-1">
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
                  </div>
               )
            )}
         </div>
      </div>
   );
};

export default ProductGroupsDisplayLabel;
