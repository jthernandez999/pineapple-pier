// app/[page]/loading.tsx
export default function Loading() {
   return (
      <div className="animate-pulse p-4">
         <div className="mb-4 h-10 w-1/2 rounded bg-gray-200" />
         <div className="space-y-4">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200"></div>
         </div>
      </div>
   );
}
