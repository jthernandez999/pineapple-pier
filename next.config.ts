export default {
   images: {
      formats: ['image/avif', 'image/webp'],
      domains: ['cdn.shopify.com'],
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'cdn.shopify.com',
            pathname: '/s/files/**'
         }
      ]
   }
};
