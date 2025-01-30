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
              'https://cdn.shopify.com/s/files/1/1024/2207/files/HAMPTON_SHORTS_YOUR_SPRING_MUST-HAVES.jpg?v=1737565216',
            // title: 'Summer Sale',
            // // description: 'Get up to 50% off!',
            // buttonText: 'Shop Now',
            // buttonLink: '/collections/shop-all-clothing'
          },
          {
            image:
              'https://cdn.shopify.com/s/files/1/1024/2207/files/HAMPTON_SHORTS_YOUR_SPRING_MUST-HAVES.jpg?v=1737565216',
            // title: 'Summer Sale',
            // description: 'Get up to 50% off!',
            // buttonText: 'Shop Now',
            // buttonLink: '/collections/shop-all-clothing'
          },
          {
            image:
              'https://cdn.shopify.com/s/files/1/1024/2207/files/HAMPTON_SHORTS_YOUR_SPRING_MUST-HAVES.jpg?v=1737565216',
          //   title: 'Summer Sale',
          //   description: 'Get up to 50% off!',
          //   buttonText: 'Shop Now',
          //   buttonLink: '/collections/shop-all-clothing'
          }
        ]}
        interval={15500} // Adjust interval to 5 seconds
      />      
      <ThreeItemGrid />
      <Carousel />
      <Footer />
    </>
  );
}
