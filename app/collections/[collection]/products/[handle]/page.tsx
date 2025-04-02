// app/collections/[collection]/products/[handle]/page.tsx
import ProductPage from '../../../../products/[handle]/page';

export default function CollectionProductPage({
   params
}: {
   params: { collection: string; handle: string };
}) {
   // Wrap the plain object in a promise so that ProductPage receives the correct type.
   return <ProductPage params={Promise.resolve(params)} />;
}
