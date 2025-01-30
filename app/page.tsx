import banners from 'assets/index';
import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import HeroBanner from 'components/hero';
import Footer from 'components/layout/footer';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: {
    type: 'website'
  }
};


export default function HomePage() {
  return (
    <>
  <HeroBanner banners={banners} interval={1100} />      
      <ThreeItemGrid />
      <Carousel />
      <Footer />
    </>
  );
}
