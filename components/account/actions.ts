'use server';

import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { removeAllCookiesServerAction } from 'lib/shopify/customer/auth-helpers';
import {
   SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
   SHOPIFY_ORIGIN,
   TAGS
} from 'lib/shopify/customer/constants';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Mutation for updating a customer address.
// Note: The fragment maps "phone" to "phoneNumber" for display.
const ADDRESS_UPDATE_MUTATION = `
  mutation AddressUpdate($addressInput: CustomerAddressInput!, $id: ID!, $defaultAddress: Boolean) {
    customerAddressUpdate(
      address: $addressInput,
      addressId: $id,
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
        address1
        address2
        firstName
        lastName
        provinceCode: zoneCode
        city
        zip
        country: territoryCode
        company
        phone: phoneNumber
        __typename
      }
      userErrors {
        field
        message
        __typename
      }
      __typename
    }
  }
  fragment CustomerAddress on CustomerAddress {
    id
    address1
    address2
    firstName
    lastName
    provinceCode: zoneCode
    city
    zip
    country: territoryCode
    company
    phone: phoneNumber
    __typename
  }
`;

/**
 * Updates a customer's address.
 *
 * @param addressInput - An object containing the address fields to update.
 *        For example: { firstName, lastName, address1, address2, city, zip, phoneNumber }
 * @param id - The ID of the customer address (e.g. "gid://shopify/CustomerAddress/6694002491481").
 * @param defaultAddress - Whether this address should be set as the default address.
 * @param customerAccessToken - The access token to authorize the request.
 */
export async function updateAddress(
   addressInput: Record<string, any>,
   id: string,
   defaultAddress: boolean,
   customerAccessToken: string
) {
   const variables = { addressInput, id, defaultAddress };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: ADDRESS_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer]
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating address', error);
      throw new Error('Error updating address');
   }
}

/* ------------------ Existing Functions (e.g. logout) ------------------ */

export async function doLogout(prevState: any) {
   const origin = SHOPIFY_ORIGIN;
   const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
   let logoutUrl;
   try {
      const idToken = (await cookies()).get('shop_id_token');
      const idTokenValue = idToken?.value;
      if (!idTokenValue) {
         logoutUrl = new URL(`${origin}/login`);
      } else {
         logoutUrl = new URL(
            `${customerAccountApiUrl}/logout?id_token_hint=${idTokenValue}&post_logout_redirect_uri=${origin}`
         );
      }
      await removeAllCookiesServerAction();
      revalidateTag(TAGS.customer);
   } catch (e) {
      console.log('Error', e);
      return 'Error logging out. Please try again';
   }
   redirect(`${logoutUrl}`);
}

// // account/actions.ts
// 'use server';

// import { shopifyCustomerFetch } from 'lib/shopify/customer';
// import { removeAllCookiesServerAction } from 'lib/shopify/customer/auth-helpers';
// import {
//    SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
//    SHOPIFY_ORIGIN,
//    TAGS
// } from 'lib/shopify/customer/constants';
// import { revalidateTag } from 'next/cache';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// const CUSTOMER_UPDATE_MUTATION = `
//   mutation CustomerUpdate($input: CustomerUpdateInput!) {
//     customerUpdate(input: $input) {
//       customer {
//         id
//         firstName
//         lastName
//         emailAddress {
//           emailAddress
//           __typename
//         }
//         phoneNumber {
//           phoneNumber
//           __typename
//         }
//         __typename
//       }
//       userErrors {
//         field
//         message
//         __typename
//       }
//       __typename
//     }
//   }
// `;

// const ADDRESS_UPDATE_MUTATION = `
//   mutation AddressUpdate($addressInput: CustomerAddressInput!, $id: ID!, $defaultAddress: Boolean) {
//     customerAddressUpdate(
//       address: $addressInput,
//       addressId: $id,
//       defaultAddress: $defaultAddress
//     ) {
//       customerAddress {
//         id
//         address1
//         address2
//         firstName
//         lastName
//         provinceCode: zoneCode
//         city
//         zip
//         country: territoryCode
//         company
//         phone: phoneNumber
//         __typename
//       }
//       userErrors {
//         field
//         message
//         __typename
//       }
//       __typename
//     }
//   }
//   fragment CustomerAddress on CustomerAddress {
//     id
//     address1
//     address2
//     firstName
//     lastName
//     provinceCode: zoneCode
//     city
//     zip
//     country: territoryCode
//     company
//     phone: phoneNumber
//     __typename
//   }
// `;

// /**
//  * Update a customer's address.
//  * @param addressInput - An object with the address fields to update.
//  * @param id - The ID of the customer address (e.g. "gid://shopify/CustomerAddress/6694002491481").
//  * @param defaultAddress - Whether this address should become the default address.
//  * @param customerAccessToken - The token to authorize the request.
//  */
// export async function updateAddress(
//    addressInput: Record<string, any>,
//    id: string,
//    defaultAddress: boolean,
//    customerAccessToken: string
// ) {
//    const variables = { addressInput, id, defaultAddress };
//    try {
//       const response = await shopifyCustomerFetch({
//          customerToken: customerAccessToken,
//          cache: 'no-store',
//          query: ADDRESS_UPDATE_MUTATION,
//          variables: variables as any,
//          tags: [TAGS.customer]
//       });
//       revalidateTag(TAGS.customer);
//       return response;
//    } catch (error) {
//       console.error('Error updating address', error);
//       throw new Error('Error updating address');
//    }
// }

// /* ------------------ Customer Update Functions ------------------ */

// export async function updateFirstName(newFirstName: string, customerAccessToken: string) {
//    const variables = { input: { firstName: newFirstName } };
//    try {
//       const response = await shopifyCustomerFetch({
//          customerToken: customerAccessToken,
//          cache: 'no-store',
//          query: CUSTOMER_UPDATE_MUTATION,
//          variables: variables as any,
//          tags: [TAGS.customer]
//       });
//       revalidateTag(TAGS.customer);
//       return response;
//    } catch (error) {
//       console.error('Error updating first name', error);
//       throw new Error('Error updating first name');
//    }
// }

// export async function updateLastName(newLastName: string, customerAccessToken: string) {
//    const variables = { input: { lastName: newLastName } };
//    try {
//       const response = await shopifyCustomerFetch({
//          customerToken: customerAccessToken,
//          cache: 'no-store',
//          query: CUSTOMER_UPDATE_MUTATION,
//          variables: variables as any,
//          tags: [TAGS.customer]
//       });
//       revalidateTag(TAGS.customer);
//       return response;
//    } catch (error) {
//       console.error('Error updating last name', error);
//       throw new Error('Error updating last name');
//    }
// }

// export async function updatePhone(newPhone: string, customerAccessToken: string) {
//    // Use the correct input key if Shopify expects "phone" or "phoneNumber".
//    // In this example, we'll try "phone". Adjust if necessary.
//    const variables = { input: { phone: newPhone } };
//    try {
//       const response = await shopifyCustomerFetch({
//          customerToken: customerAccessToken,
//          cache: 'no-store',
//          query: CUSTOMER_UPDATE_MUTATION,
//          variables: variables as any,
//          tags: [TAGS.customer]
//       });
//       revalidateTag(TAGS.customer);
//       return response;
//    } catch (error) {
//       console.error('Error updating phone number', error);
//       throw new Error('Error updating phone number');
//    }
// }

// /* ------------------ Logout Function ------------------ */

// export async function doLogout(prevState: any) {
//    const origin = SHOPIFY_ORIGIN;
//    const customerAccountApiUrl = SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
//    let logoutUrl;
//    try {
//       const idToken = (await cookies()).get('shop_id_token');
//       const idTokenValue = idToken?.value;
//       if (!idTokenValue) {
//          logoutUrl = new URL(`${origin}/login`);
//       } else {
//          logoutUrl = new URL(
//             `${customerAccountApiUrl}/logout?id_token_hint=${idTokenValue}&post_logout_redirect_uri=${origin}`
//          );
//       }
//       await removeAllCookiesServerAction();
//       revalidateTag(TAGS.customer);
//    } catch (e) {
//       console.log('Error', e);
//       return 'Error logging out. Please try again';
//    }
//    redirect(`${logoutUrl}`);
// }
