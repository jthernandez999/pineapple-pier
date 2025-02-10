import { ColorSwatch } from 'components/ColorSwatch';
import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import { Product } from 'lib/shopify/types';
import Link from 'next/link';

export default function ProductGridItems({ products }: { products: Product[] }) {
   return (
      <>
         {products.map((product) => {
            // Attempt to extract the metaobject ID for the color swatch.
            let metaobjectId: string | null = null;
            if (product.metafields && product.metafields.length > 0) {
               // Find the metafield with key "color-pattern"
               const found = product.metafields.find((mf) => mf.key === 'color-pattern');
               if (found && found.value) {
                  try {
                     // Parse the JSON string (e.g. '["gid://shopify/Metaobject/78677147737"]')
                     const metaobjectIds = JSON.parse(found.value);
                     if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
                        metaobjectId = metaobjectIds[0]; // Use the first metaobject ID.
                     }
                  } catch (error) {
                     console.error('Error parsing metafield value:', error);
                  }
               }
            }

            return (
               <Grid.Item key={product.handle} className="animate-fadeIn">
                  <Link
                     className="relative inline-block h-full w-full"
                     href={`/product/${product.handle}`}
                     prefetch={true}
                  >
                     <GridTileImage
                        alt={product.title}
                        label={{
                           title: product.title,
                           amount: product.priceRange.maxVariantPrice.amount,
                           currencyCode: product.priceRange.maxVariantPrice.currencyCode
                        }}
                        src={product.featuredImage?.url}
                        secondarySrc={product.images[1]?.url}
                        // Use the second image if available
                        fill
                        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                     />
                     {/* If a metaobjectId was found, render the ColorSwatch component over the image */}
                     {metaobjectId && (
                        <div className="absolute bottom-2 left-2">
                           <ColorSwatch metaobjectId={metaobjectId} fallbackColor="#ccc" />
                        </div>
                     )}
                  </Link>
               </Grid.Item>
            );
         })}
      </>
   );
}

// import Grid from 'components/grid';
// import { GridTileImage } from 'components/grid/tile';
// import { Product } from 'lib/shopify/types';
// import Link from 'next/link';

// export default function ProductGridItems({ products }: { products: Product[] }) {
//   return (
//     <>
//       {products.map((product) => (
//         <Grid.Item key={product.handle} className="animate-fadeIn">
//           <Link
//             className="relative inline-block h-full w-full"
//             href={`/product/${product.handle}`}
//             prefetch={true}
//           >
//             <GridTileImage
//               alt={product.title}
//               label={{
//                 title: product.title,
//                 amount: product.priceRange.maxVariantPrice.amount,
//                 currencyCode: product.priceRange.maxVariantPrice.currencyCode
//               }}
//               src={product.featuredImage?.url}
//               fill
//               sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
//             />
//           </Link>
//         </Grid.Item>
//       ))}
//     </>
//   );
// }
