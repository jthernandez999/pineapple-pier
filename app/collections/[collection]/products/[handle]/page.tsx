// app/collections/[collection]/products/[handle]/page.tsx
import ProductPage from '../../../../products/[handle]/page';

export default function CollectionProductPage({
   params
}: {
   params: { collection: string; handle: string };
}) {
   // Pass params directly (as a plain object) to ProductPage.
   return <ProductPage params={params} />;
}
