// app/collections/[collection]/products/[handle]/page.tsx
import ProductPage from '../../../../products/[handle]/page';

export default function CollectionProductPage({
   params
}: {
   params: { collection: string; handle: string };
}) {
   return (
      <ProductPage
         params={Promise.resolve(params) as Promise<{ collection: string; handle: string }>}
      />
   );
}
