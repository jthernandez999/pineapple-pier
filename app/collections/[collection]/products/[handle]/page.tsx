// app/collections/[collection]/products/[handle]/page.tsx
import ProductPage from '../../../../products/[handle]/page';

export default function CollectionProductPage({
   params
}: {
   params: { collection: string; handle: string };
}) {
   // Wrap the plain object in a Promise and cast to the expected type.
   return (
      <ProductPage
         params={Promise.resolve(params) as Promise<{ collection: string; handle: string }>}
      />
   );
}
