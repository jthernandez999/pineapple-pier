import { usePathname } from 'next/navigation';

export function useCollectionSlug() {
   const pathname = usePathname(); // e.g., "/collections/shop-new-arrivals/products/julian-denim-short-indigo-stripe"
   const segments = pathname.split('/');
   // The URL structure is assumed to be: /collections/{collectionSlug}/products/{handle}
   if (segments.length >= 3 && segments[1] === 'collections') {
      return segments[2]; // This is the collection slug
   }
   return null;
}
