// account/actions.ts
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

// Updated mutation per your provided sample.
const CUSTOMER_UPDATE_MUTATION = `
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      userErrors {
        field
        message
      }
      customer {
        firstName
        lastName
      }
    }
  }
`;

/* ------------------ Update Functions ------------------ */

// Each update function calls shopifyCustomerFetch with the CUSTOMER_UPDATE_MUTATION.
// Adjust the input object as needed if you want to update fields beyond firstName and lastName.

export async function updateFirstName(newFirstName: string, customerAccessToken: string) {
   const variables = { input: { firstName: newFirstName } };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer],
         headers: {
            'X-Shopify-Customer-Access-Token': customerAccessToken
         }
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating first name', error);
      throw new Error('Error updating first name');
   }
}

export async function updateLastName(newLastName: string, customerAccessToken: string) {
   const variables = { input: { lastName: newLastName } };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer],
         headers: {
            'X-Shopify-Customer-Access-Token': customerAccessToken
         }
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating last name', error);
      throw new Error('Error updating last name');
   }
}

// You can similarly add updateEmail, updatePhone, updateBirthday functions if the mutation is updated to support those fields.
// For example, if you extend the mutation to support email updates, you could do:
export async function updateEmail(newEmail: string, customerAccessToken: string) {
   const variables = { input: { email: newEmail } };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer],
         headers: {
            'X-Shopify-Customer-Access-Token': customerAccessToken
         }
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating email', error);
      throw new Error('Error updating email');
   }
}

/* ------------------ Logout Function ------------------ */

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
