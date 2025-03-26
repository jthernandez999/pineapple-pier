import { banners, collectionImages, highlightCollectionImages } from 'assets/index';
import { Carousel } from 'components/carousel';
import HeroBanner from 'components/hero';
import HighlightCollection from 'components/highlightCollection';
import Footer from 'components/layout/footer';
import ThreeImageCollections from 'components/three-collections';
import { getCollectionProducts } from '../lib/shopify';

export const metadata = {
   description: 'Dear John Denim, a premium denim brand that offers a wide range of denim',
   openGraph: {
      type: 'website'
   }
};

export default async function HomePage() {
   const collection = 'shop-new-arrivals';
   // Let Shopify return the default ordering by omitting sortKey and reverse:
   const data = await getCollectionProducts({ collection });
   return (
      <>
         <HeroBanner banners={banners} interval={6000} />
         <ThreeImageCollections collectionImages={collectionImages} />
         <Carousel data={data} />
         <HighlightCollection highlightCollectionImages={highlightCollectionImages} />
         <Footer />
      </>
   );
}
