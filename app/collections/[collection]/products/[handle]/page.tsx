// app/collections/[collection]/products/[handle]/page.tsx
import ProductPage from '../../../../products/[handle]/page';

export default function CollectionProductPage({
   params
}: {
   params: { collection: string; handle: string };
}) {
   // Wrap the plain params object in a promise:
   return <ProductPage params={Promise.resolve(params)} />;
}
