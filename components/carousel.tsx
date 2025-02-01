import { getCollectionProducts } from 'lib/shopify';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

export async function Carousel() {
  // Collections that start with `hidden-*` are hidden from the search page.
  const products = await getCollectionProducts({ collection: 'whats-hot' });

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="h-full w-full overflow-x-auto pb-0 pt-0">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-[2/3] w-[66.67vw] flex-none sm:aspect-[2/3] sm:w-[20vw] md:w-[20vw] lg:w-[20vw] xl:w-[20vw] 2xl:w-[20vw]"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={product.featuredImage?.url}
                fill
                sizes="100vw, (min-width: 768px) 20vw" // adjust as needed
                className="object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
