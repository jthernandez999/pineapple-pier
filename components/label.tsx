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
         // Ensures this container takes up the full width and doesn't shrink,
         // so if the parent is using a flex row layout, it will break to a new line.
         className={clsx('relative mt-2 w-full flex-none', {
            'lg:px-20 lg:pb-[35%]': position === 'center'
         })}
         style={{ display: 'block' }}
      >
         <div className="absolute mb-72 rounded-md border bg-white/70 p-2 pb-72 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
            {/* Product Title & Price */}
            <div className="mb-2">
               <div className="flex flex-col">
                  <h3 className="line-clamp-2 leading-none tracking-tight">{title}</h3>
                  <Price
                     className="mt-1 rounded-sm p-2 text-black"
                     amount={amount}
                     currencyCode={currencyCode}
                     currencyCodeClassName="hidden @[275px]/label:inline"
                  />
               </div>
            </div>
            {/* Color Info Section */}
            <div className="flex flex-col space-y-1">
               {colorName && <div className="text-sm">{colorName}</div>}
               {metaobjectId ? (
                  <div>
                     <ColorSwatch metaobjectId={metaobjectId} fallbackColor={fallbackColor} />
                  </div>
               ) : (
                  fallbackColor && (
                     <div>
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
                     </div>
                  )
               )}
            </div>
         </div>
      </div>
   );
};

export default Label;
