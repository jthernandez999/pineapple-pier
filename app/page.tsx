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
  <HeroBanner
        banners={[
          {
            image:
              'https://cdn.shopify.com/s/files/1/1024/2207/files/20241014_00189_mb1_lp_369e1f9c-d0d5-4082-b1ba-e7a14781a882.jpg?v=17321271034',
            title: 'New Arrivals',
            description: 'Discover the latest trends.',
            buttonText: 'Explore',
            buttonLink: '/collections/shop-new-arrivals'
          },
          {
            image:
              'https://cdn.shopify.com/s/files/1/1024/2207/files/Happy_Couple_Wedding_Thank_You_Postcard_2100_x_1100_px_1.png?v=1732063540',
            title: 'Summer Sale',
            description: 'Get up to 50% off!',
            buttonText: 'Shop Now',
            buttonLink: '/collections/shop-all-clothing'
          },
          {
            image:
              'https://cdn.shopify.com/s/files/1/1024/2207/files/20241014_01662_copymb3_lp_c03e1eea-fbbc-4068-95ae-e0cb103f7ea5.jpg?v=1732127515',
            title: 'Exclusive Denim',
            description: 'Experience premium denim.',
            buttonText: 'Discover',
            buttonLink: '/collections/shop-all-denim'
          }
        ]}
        interval={5500} // Adjust interval to 5 seconds
      />      
      <ThreeItemGrid />
      <Carousel />
      <Footer />
    </>
  );
}
