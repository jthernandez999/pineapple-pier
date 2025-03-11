// AddToCart.tsx
import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
import { useProduct } from 'components/product/product-context';
import { Product, ProductVariant } from 'lib/shopify/types';
import { useActionState } from 'react';
import { useCart } from './cart-context';

const SubmitButton = ({
   availableForSale,
   selectedVariantId
}: {
   availableForSale: boolean;
   selectedVariantId?: string;
}) => {
   const buttonClasses =
      'relative flex w-full items-center justify-center bg-black p-4 tracking-wide text-white';
   const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

   if (!availableForSale) {
      return (
         <button disabled className={clsx(buttonClasses, disabledClasses)}>
            Out Of Stock
         </button>
      );
   }

   if (!selectedVariantId) {
      return (
         <button
            aria-label="Please select an option"
            disabled
            className={clsx(buttonClasses, disabledClasses)}
         >
            <div className="absolute left-0 ml-4">
               <PlusIcon className="h-5" />
            </div>
            Add To Cart
         </button>
      );
   }

   return (
      <button aria-label="Add to cart" className={clsx(buttonClasses, 'hover:opacity-90')}>
         <div className="absolute left-0 ml-4">
            <PlusIcon className="h-5" />
         </div>
         Add To Cart
      </button>
   );
};

export function AddToCart({ product }: { product: Product }) {
   const { variants, availableForSale } = product;
   const { addCartItem } = useCart();
   const { state } = useProduct();
   const [message, formAction] = useActionState(addItem, null);

   // Create a default state from the first variant's options.
   let defaultState: { [key: string]: string } = {};
   if (variants.length > 0) {
      variants[0]?.selectedOptions.forEach((option) => {
         // Lowercase the default values for consistency.
         defaultState[option.name.toLowerCase()] = option.value.toLowerCase();
      });
   }

   // Merge the default state with the current state.
   const mergedState = { ...defaultState, ...state };

   // Find the matching variant using the merged state (normalize both sides to lowercase).
   const variant = variants.find((variant: ProductVariant) =>
      variant.selectedOptions.every(
         (option) =>
            option.value.toLowerCase() ===
            String(mergedState[option.name.toLowerCase()]).toLowerCase()
      )
   );

   // If only one variant exists, or if a variant is found via state or defaults, select it.
   const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
   const selectedVariantId = variant?.id || defaultVariantId;

   const actionWithVariant = formAction.bind(null, selectedVariantId);
   const finalVariant = variants.find((variant) => variant.id === selectedVariantId)!;
   console.log('finalVariant:::::::::', finalVariant);

   const handleSubmit = async () => {
      console.log('selectedVariantID', selectedVariantId);
      addCartItem(finalVariant, product);
      await actionWithVariant();
   };

   return (
      <form action={handleSubmit}>
         <SubmitButton availableForSale={availableForSale} selectedVariantId={selectedVariantId} />
         <p aria-live="polite" className="sr-only" role="status">
            {message}
         </p>
      </form>
   );
}
