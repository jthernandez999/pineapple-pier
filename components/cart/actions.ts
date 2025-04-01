'use server';

import { TAGS } from 'lib/constants';
import { addToCart, getCart, removeFromCart, updateCart } from 'lib/shopify';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { checkoutCreateMutation } from 'lib/shopify/mutations/cart';

export async function addItem(prevState: any, selectedVariantId: string | undefined) {
   let cartId = (await cookies()).get('cartId')?.value;

   if (!cartId || !selectedVariantId) {
      return 'Error adding item to cart';
   }

   try {
      await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
      revalidateTag(TAGS.cart);
   } catch (e) {
      return 'Error adding item to cart';
   }
}

export async function removeItem(prevState: any, merchandiseId: string) {
   let cartId = (await cookies()).get('cartId')?.value;

   if (!cartId) {
      return 'Missing cart ID';
   }

   try {
      const cart = await getCart(cartId);

      if (!cart) {
         return 'Error fetching cart';
      }

      const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

      if (lineItem && lineItem.id) {
         await removeFromCart(cartId, [lineItem.id]);
         revalidateTag(TAGS.cart);
      } else {
         return 'Item not found in cart';
      }
   } catch (e) {
      return 'Error removing item from cart';
   }
}

export async function updateItemQuantity(
   prevState: any,
   payload: {
      merchandiseId: string;
      quantity: number;
   }
) {
   let cartId = (await cookies()).get('cartId')?.value;

   if (!cartId) {
      return 'Missing cart ID';
   }

   const { merchandiseId, quantity } = payload;

   try {
      const cart = await getCart(cartId);

      if (!cart) {
         return 'Error fetching cart';
      }

      const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

      if (lineItem && lineItem.id) {
         if (quantity === 0) {
            await removeFromCart(cartId, [lineItem.id]);
         } else {
            await updateCart(cartId, [
               {
                  id: lineItem.id,
                  merchandiseId,
                  quantity
               }
            ]);
         }
      } else if (quantity > 0) {
         // If the item doesn't exist in the cart and quantity > 0, add it
         await addToCart(cartId, [{ merchandiseId, quantity }]);
      }

      revalidateTag(TAGS.cart);
   } catch (e) {
      console.error(e);
      return 'Error updating item quantity';
   }
}

// export async function redirectToCheckout() {
//    let cartId = (await cookies()).get('cartId')?.value;
//    if (!cartId) {
//       throw new Error('Missing cartId cookie');
//    }

//    let cart = await getCart(cartId);
//    if (!cart) {
//       throw new Error('Cart not found');
//    }

//    let checkoutUrl = cart.checkoutUrl;
//    console.log('Original checkoutUrl:', checkoutUrl);

//    // Parse the URL to check its host
//    const parsedUrl = new URL(checkoutUrl);

//    // If the URL is pointing to our front end, we need to transform it.
//    if (parsedUrl.hostname === 'dearjohndenim.com' && parsedUrl.pathname.startsWith('/cart/c/')) {
//       // Get the encoded part after "/cart/c/"
//       const encodedPart = parsedUrl.pathname.replace('/cart/c/', '');

//       // Try to extract the checkout ID from the encoded part (assumes it contains a sequence of digits)
//       const match = encodedPart.match(/(\d+)/);
//       let checkoutId = match ? match[1] : 'default';

//       // Build the new checkout URL in Shopify's expected format.
//       // Note: 'shop.app' is used as an example; Shopify might use a different domain.
//       let newUrl = `https://shop.app/checkout/${checkoutId}/cn/${encodedPart}/shoppay?redirect_source=checkout_automatic_redirect`;

//       // Append original query string parameters if any exist.
//       if (parsedUrl.search) {
//          newUrl += '&' + parsedUrl.search.substring(1);
//       }

//       checkoutUrl = newUrl;
//    }

//    console.log('Transformed checkoutUrl:', checkoutUrl);
//    redirect(checkoutUrl);
// }

// export async function redirectToCheckout() {
//   let cartId = (await cookies()).get('cartId')?.value;
//   let cart = await getCart(cartId);

//   redirect(cart!.checkoutUrl);
// }

// Ensure you have a proper type for your cart line.
interface CartLine {
   quantity: number;
   merchandise: {
      id: string;
      // ...other properties as needed.
   };
}

export async function redirectToCheckout() {
   let cartId = (await cookies()).get('cartId')?.value;
   if (!cartId) {
      throw new Error('Missing cartId cookie');
   }

   const cart = await getCart(cartId);
   if (!cart) {
      throw new Error('Cart not found');
   }

   // Adjust based on your actual data shape:
   // If cart.lines is an array:
   const lineItems = cart.lines.map((line: CartLine) => ({
      variantId: line.merchandise.id,
      quantity: line.quantity
   }));

   // If your API expects a different shape, adjust accordingly.
   const input = { lineItems };

   const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
   if (!storefrontAccessToken) {
      throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined');
   }

   const response = await fetch(
      'https://dear-john-denim-headquarters.myshopify.com/api/2023-01/graphql.json',
      {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontAccessToken
         },
         body: JSON.stringify({
            query: checkoutCreateMutation,
            variables: { input }
         })
      }
   );

   const json = await response.json();
   if (json.errors) {
      console.error('CheckoutCreate errors:', json.errors);
      throw new Error('CheckoutCreate mutation failed');
   }

   const { checkout, checkoutUserErrors } = json.data.checkoutCreate;
   if (checkoutUserErrors && checkoutUserErrors.length > 0) {
      console.error('Checkout user errors:', checkoutUserErrors);
      throw new Error('Checkout creation encountered errors');
   }

   console.log('Checkout URL:', checkout.webUrl);
   redirect(checkout.webUrl);
}

export async function createCartAndSetCookie() {
   let cartId = (await cookies()).get('cartId')?.value;
   if (!cartId) {
      throw new Error('Missing cartId cookie');
   }
   const cart = await getCart(cartId); // Correct: cartId is provided
}
