// app/collections/[collection]/products/[handle]/page.tsx
import ProductPage from '../../../../products/[handle]/page';

export default function CollectionProductPage(props: any) {
   return <ProductPage params={Promise.resolve(props.params)} />;
}
