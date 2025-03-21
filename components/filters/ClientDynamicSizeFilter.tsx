// components/filters/ClientDynamicSizeFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DynamicSizeFilter } from './SizeFilter';

interface ClientDynamicSizeFilterProps {
   letters: string[];
   numerics: number[];
}

export default function ClientDynamicSizeFilter({
   letters,
   numerics
}: ClientDynamicSizeFilterProps) {
   const router = useRouter();
   const searchParams = useSearchParams();

   const initialSelected = searchParams.get('size')?.split(',') || [];
   const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSelected);

   const toggleSize = (size: string) => {
      setSelectedSizes((prev) =>
         prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
      );
   };

   const onSelectSize = (size: string) => {
      toggleSize(size);
   };

   const handleApplyFilters = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('size');
      if (selectedSizes.length > 0) {
         params.set('size', selectedSizes.join(','));
      }
      router.push(`${window.location.pathname}?${params.toString()}`);
   };

   const handleClearFilters = () => {
      setSelectedSizes([]);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('size');
      router.push(`${window.location.pathname}?${params.toString()}`);
   };

   return (
      <div className="flex flex-col space-y-4">
         <DynamicSizeFilter letters={letters} numerics={numerics} onSelectSize={onSelectSize} />
         <div className="flex gap-4">
            <button
               onClick={handleApplyFilters}
               className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
               Apply Filters
            </button>
            <button
               onClick={handleClearFilters}
               className="rounded border px-4 py-2 text-black hover:bg-gray-200"
            >
               Clear Filters
            </button>
         </div>
         {selectedSizes.length > 0 && (
            <p className="text-sm text-gray-600">Selected: {selectedSizes.join(', ')}</p>
         )}
      </div>
   );
}
