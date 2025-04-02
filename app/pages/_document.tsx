// pages/_document.tsx
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
   render() {
      return (
         <Html>
            <Head>
               {/* Include the Shopify Web Pixel script */}
               <script src="https://cdn.shopify.com/s/shopify-web-pixels-extension.js" async />
            </Head>
            <body>
               <Main />
               <NextScript />
            </body>
         </Html>
      );
   }
}

export default MyDocument;
