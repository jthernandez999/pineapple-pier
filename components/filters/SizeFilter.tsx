// components/filters/SizeFilter.tsx
'use client';

interface DynamicSizeFilterProps {
   letters: string[];
   numerics: number[];
   onSelectSize: (size: string) => void;
}

export function DynamicSizeFilter({ letters, numerics, onSelectSize }: DynamicSizeFilterProps) {
   // If no sizes found, render fallback.
   if (letters.length === 0 && numerics.length === 0) {
      return (
         <div className="flex flex-col space-y-4">
            <label className="mb-2 block font-semibold">Size</label>
            <button
               onClick={() => onSelectSize('')}
               className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white"
            >
               All
            </button>
         </div>
      );
   }

   return (
      <div className="flex flex-col space-y-4">
         {letters.length > 0 && (
            <div>
               <label className="mb-2 block font-semibold">Top Sizes</label>
               <div className="flex flex-wrap gap-2">
                  {letters.map((size) => (
                     <button
                        key={size}
                        onClick={() => onSelectSize(size)}
                        className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white"
                     >
                        {size}
                     </button>
                  ))}
               </div>
            </div>
         )}
         {numerics.length > 0 && (
            <div>
               <label className="mb-2 block font-semibold">Bottom Sizes</label>
               <div className="flex flex-wrap gap-2">
                  {numerics.map((size) => (
                     <button
                        key={size}
                        onClick={() => onSelectSize(size.toString())}
                        className="rounded border px-3 py-1 text-sm hover:bg-black hover:text-white"
                     >
                        {size}
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
