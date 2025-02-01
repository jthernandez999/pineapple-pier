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
    // <div className="h-full w-full overflow-x-auto pb-0 pt-0">
    <div className="h-full w-full overflow-x-auto pb-0 pt-0">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-[2/3] h-[30vh] w-[20vw] max-w-[20vw] flex-none sm:h-[30vw] sm:w-[20vw] md:h-[30vw] md:w-[20vw] lg:h-[30vw] lg:w-[20vw] xl:h-[30vw] xl:w-[20vw] 2xl:h-[30vw] 2xl:w-[20vw]"
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
                sizes="100vw 30vw 20vw 15vw 10vw 5vw 2.5vw 1.25vw 1vw 0.5vw 0.25vw 0.125vw 0.0625vw 0.03125vw 0.015625vw 0.0078125vw" // 16 sizes
                className="object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
