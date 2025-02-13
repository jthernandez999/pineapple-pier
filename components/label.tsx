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
            {/* Row 3: Color Swatch */}
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
   );
};

export default Label;

// import clsx from 'clsx';
// import Price from './price';

// const Label = ({
//    title,
//    amount,
//    currencyCode,
//    position = 'bottom'
// }: {
//    title: string;
//    amount: string;
//    currencyCode: string;
//    position?: 'bottom' | 'center';
// }) => {
//    return (
//       <div
//          className={clsx('absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label', {
//             'lg:px-20 lg:pb-[35%]': position === 'center'
//          })}
//       >
//          <div className="flex items-center rounded-md border bg-white/70 p-1 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
//             <h3 className="mr-4 line-clamp-2 flex-grow pl-2 leading-none tracking-tight">
//                {title}
//             </h3>
//             <Price
//                className="rounded-ms flex-none p-2 text-black"
//                amount={amount}
//                currencyCode={currencyCode}
//                currencyCodeClassName="hidden @[275px]/label:inline"
//             />
//          </div>
//       </div>
//    );
// };

// export default Label;
