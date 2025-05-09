'use server';

import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from 'lib/shopify';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface CartLine {
   quantity: number;
   merchandise: {
      id: string;
      // ...other properties as needed.
   };
}

/**
 * Adds a variant to the cart.
 */
export async function addItem(
   prevState: any,
   selectedVariantId: string | undefined
): Promise<string | void> {
   const cookieStore = await cookies();
   const cartId = cookieStore.get('cartId')?.value;
   if (!cartId || !selectedVariantId) {
      return 'Error adding item to cart';
   }

   try {
      // Call addToCart with cartId and an array of line items.
      await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
      revalidateTag(TAGS.cart);
   } catch (error) {
      console.error('Error adding item to cart:', error);
      return 'Error adding item to cart';
   }
}

/**
 * Removes an item from the cart by merchandise id.
 */
export async function removeItem(prevState: any, merchandiseId: string): Promise<string | void> {
   const cookieStore = await cookies();
   const cartId = cookieStore.get('cartId')?.value;
   if (!cartId) {
      return 'Missing cart ID';
   }

   try {
      const cart = await getCart(cartId);
      if (!cart) {
         return 'Error fetching cart';
      }

      // Find the matching line item.
      const lineItem = cart.lines.find((line: CartLine) => line.merchandise.id === merchandiseId);
      if (lineItem && lineItem.id) {
         // Call removeFromCart with cartId and the line item id.
         await removeFromCart(cartId, [lineItem.id]);
         revalidateTag(TAGS.cart);
      } else {
         return 'Item not found in cart';
      }
   } catch (error) {
      console.error('Error removing item from cart:', error);
      return 'Error removing item from cart';
   }
}

/**
 * Updates the quantity of an item in the cart.
 */
export async function updateItemQuantity(
   prevState: any,
   payload: { merchandiseId: string; quantity: number }
): Promise<string | void> {
   const cookieStore = await cookies();
   const cartId = cookieStore.get('cartId')?.value;
   if (!cartId) {
      return 'Missing cart ID';
   }

   const { merchandiseId, quantity } = payload;
   try {
      const cart = await getCart(cartId);
      if (!cart) {
         return 'Error fetching cart';
      }

      const lineItem = cart.lines.find((line: CartLine) => line.merchandise.id === merchandiseId);
      if (lineItem && lineItem.id) {
         if (quantity === 0) {
            await removeFromCart(cartId, [lineItem.id]);
         } else {
            // Call updateCart with cartId and an array containing the update object.
            await updateCart(cartId, [{ id: lineItem.id, merchandiseId, quantity }]);
         }
      } else if (quantity > 0) {
         // If the item doesn't exist in the cart and quantity > 0, add it.
         await addToCart(cartId, [{ merchandiseId, quantity }]);
      }
      revalidateTag(TAGS.cart);
   } catch (error) {
      console.error('Error updating item quantity:', error);
      return 'Error updating item quantity';
   }
}

/**
 * Redirects the user to Shopify's checkout.
 * Uses the checkoutUrl from the cart and transforms it if needed.
 */
export async function redirectToCheckout(): Promise<void> {
   const cookieStore = await cookies();
   const cartId = cookieStore.get('cartId')?.value;
   if (!cartId) throw new Error('Missing cartId cookie');

   const cart = await getCart(cartId);
   if (!cart) throw new Error('Cart not found');

   // Use the checkoutUrl from the cart query as provided.
   let checkoutUrl = cart.checkoutUrl;
   console.log('Original checkoutUrl:', checkoutUrl);

   // If the URL is not absolute (or does not begin with the correct checkout path), log a warning.
   try {
      const parsedUrl = new URL(checkoutUrl, 'https://dearjohndenim.com');
      // If the checkoutUrl's hostname is your front-end domain, that's a sign it wasn't set up correctly.
      if (parsedUrl.hostname === 'dearjohndenim.com') {
         console.error(
            'Checkout URL appears to be relative; please check your Shopify domain settings.'
         );
         // Optionally, you might try to manually build the URL here if you know the expected format.
         // However, without a reliable way to extract the dynamic checkoutId, this is fragile.
      }
   } catch (error) {
      console.error('Error parsing checkoutUrl:', error);
   }

   // Redirect using the URL provided by Shopify.
   redirect(checkoutUrl);
}

// At the bottom (or appropriate location) of components/cart/actions.ts
export async function createCartAndSetCookie(): Promise<void> {
   const cookieStore = await cookies();
   let cartId = cookieStore.get('cartId')?.value;

   if (!cartId) {
      // Create a new cart if none exists.
      const cart = await createCart();
      if (!cart || !cart.id) {
         throw new Error('Failed to create cart');
      }
      cookieStore.set('cartId', cart.id);
   } else {
      // Optionally, verify the cart exists; if not, create a new one.
      const cart = await getCart(cartId);
      if (!cart) {
         const newCart = await createCart();
         if (!newCart || !newCart.id) {
            throw new Error('Failed to create cart');
         }
         cookieStore.set('cartId', newCart.id);
      }
   }
}

// 'use server';

// import { TAGS } from 'lib/constants';
// import { addToCart, getCart, removeFromCart, updateCart } from 'lib/shopify';
// import { revalidateTag } from 'next/cache';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export async function addItem(prevState: any, selectedVariantId: string | undefined) {
//    let cartId = (await cookies()).get('cartId')?.value;

//    if (!cartId || !selectedVariantId) {
//       return 'Error adding item to cart';
//    }

//    try {
//       await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
//       revalidateTag(TAGS.cart);
//    } catch (e) {
//       return 'Error adding item to cart';
//    }
// }

// export async function removeItem(prevState: any, merchandiseId: string) {
//    let cartId = (await cookies()).get('cartId')?.value;

//    if (!cartId) {
//       return 'Missing cart ID';
//    }

//    try {
//       const cart = await getCart(cartId);

//       if (!cart) {
//          return 'Error fetching cart';
//       }

//       const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

//       if (lineItem && lineItem.id) {
//          await removeFromCart(cartId, [lineItem.id]);
//          revalidateTag(TAGS.cart);
//       } else {
//          return 'Item not found in cart';
//       }
//    } catch (e) {
//       return 'Error removing item from cart';
//    }
// }

// export async function updateItemQuantity(
//    prevState: any,
//    payload: {
//       merchandiseId: string;
//       quantity: number;
//    }
// ) {
//    let cartId = (await cookies()).get('cartId')?.value;

//    if (!cartId) {
//       return 'Missing cart ID';
//    }

//    const { merchandiseId, quantity } = payload;

//    try {
//       const cart = await getCart(cartId);

//       if (!cart) {
//          return 'Error fetching cart';
//       }

//       const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

//       if (lineItem && lineItem.id) {
//          if (quantity === 0) {
//             await removeFromCart(cartId, [lineItem.id]);
//          } else {
//             await updateCart(cartId, [
//                {
//                   id: lineItem.id,
//                   merchandiseId,
//                   quantity
//                }
//             ]);
//          }
//       } else if (quantity > 0) {
//          // If the item doesn't exist in the cart and quantity > 0, add it
//          await addToCart(cartId, [{ merchandiseId, quantity }]);
//       }

//       revalidateTag(TAGS.cart);
//    } catch (e) {
//       console.error(e);
//       return 'Error updating item quantity';
//    }
// }

// // Ensure you have a proper type for your cart line.
// interface CartLine {
//    quantity: number;
//    merchandise: {
//       id: string;
//       // ...other properties as needed.
//    };
// }

// // export async function redirectToCheckout() {
// //    let cartId = (await cookies()).get('cartId')?.value;
// //    if (!cartId) {
// //       throw new Error('Missing cartId cookie');
// //    }

// //    const cart = await getCart(cartId);
// //    if (!cart) {
// //       throw new Error('Cart not found');
// //    }

// //    // Adjust based on your actual data shape:
// //    // If cart.lines is an array:
// //    const lineItems = cart.lines.map((line: CartLine) => ({
// //       variantId: line.merchandise.id,
// //       quantity: line.quantity
// //    }));

// //    // If your API expects a different shape, adjust accordingly.
// //    const input = { lineItems };

// //    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
// //    if (!storefrontAccessToken) {
// //       throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined');
// //    }

// //    const response = await fetch(
// //       'https://dear-john-denim-headquarters.myshopify.com/api/2023-01/graphql.json',
// //       {
// //          method: 'POST',
// //          headers: {
// //             'Content-Type': 'application/json',
// //             'X-Shopify-Storefront-Access-Token': storefrontAccessToken
// //          },
// //          body: JSON.stringify({
// //             query: checkoutCreateMutation,
// //             variables: { input }
// //          })
// //       }
// //    );

// //    const json = await response.json();
// //    if (json.errors) {
// //       console.error('CheckoutCreate errors:', json.errors);
// //       throw new Error('CheckoutCreate mutation failed');
// //    }

// //    const { checkout, checkoutUserErrors } = json.data.checkoutCreate;
// //    if (checkoutUserErrors && checkoutUserErrors.length > 0) {
// //       console.error('Checkout user errors:', checkoutUserErrors);
// //       throw new Error('Checkout creation encountered errors');
// //    }

// //    console.log('Checkout URL:', checkout.webUrl);
// //    redirect(checkout.webUrl);
// // }

// export async function redirectToCheckout() {
//    let cartId = (await cookies()).get('cartId')?.value;
//    if (!cartId) throw new Error('Missing cartId cookie');

//    const cart = await getCart(cartId);
//    if (!cart) throw new Error('Cart not found');

//    // Use the checkoutUrl from the cart query
//    let checkoutUrl = cart.checkoutUrl;
//    console.log('Original checkoutUrl:', checkoutUrl);

//    // If checkoutUrl is relative or still points to your front end, transform it:
//    try {
//       const parsedUrl = new URL(checkoutUrl, 'https://dearjohndenim.com');
//       if (parsedUrl.hostname === 'dearjohndenim.com') {
//          // Replace your front end domain with Shopify's checkout domain.
//          // Update 'shop.app' to your store's correct checkout domain if different.
//          checkoutUrl = checkoutUrl.replace('https://dearjohndenim.com', 'https://shop.app');
//       }
//    } catch (error) {
//       console.error('Error parsing checkoutUrl', error);
//    }

//    console.log('Transformed checkoutUrl:', checkoutUrl);
//    redirect(checkoutUrl);
// }

// export async function createCartAndSetCookie() {
//    let cartId = (await cookies()).get('cartId')?.value;
//    if (!cartId) {
//       throw new Error('Missing cartId cookie');
//    }
//    let cart = await getCart(cartId); // Correct: cartId is provided
// }

// // export async function createCartAndSetCookie() {
// //   let cart = await createCart();
// //   (await cookies()).set('cartId', cart.id!);
// // }
