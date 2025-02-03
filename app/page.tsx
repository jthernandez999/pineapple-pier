import { banners, collectionImages, highlightCollectionImages } from 'assets/index';
import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import HeroBanner from 'components/hero';
import HighlightCollection from 'components/highlightCollection';
import Footer from 'components/layout/footer';
import ThreeImageCollections from 'components/three-collections';

export const metadata = {
   description: 'Dear John Denim, a premium denim brand that offers a wide range of denim',
   openGraph: {
      type: 'website'
   }
};

export default function HomePage() {
   return (
      <>
         <HeroBanner banners={banners} interval={1100} />
         <ThreeImageCollections collectionImages={collectionImages} />
         <Carousel />
         <HighlightCollection highlightCollectionImages={highlightCollectionImages} />
         <ThreeItemGrid />
         <Footer />
      </>
   );
}
