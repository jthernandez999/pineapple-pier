// app/collections/[collection]/page.tsx
import SearchPage from '../../search/[collection]/page';

export default function CollectionsPage(props: any) {
   return <SearchPage {...props} />;
}

// // app/collections/[collection]/page.tsx
// export { default } from '../../search/[collection]/page';
