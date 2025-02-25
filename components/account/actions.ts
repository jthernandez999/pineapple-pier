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

const CUSTOMER_UPDATE_MUTATION = `
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
        metafields(namespace: "custom", first: 1) {
          edges {
            node {
              key
              value
            }
          }
        }
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`;

/* ------------------ Update Functions ------------------ */
// Ensure the customerAccessToken you pass is valid and current.
// We cast variables as any to bypass type errors.
export async function updateFirstName(newFirstName: string, customerAccessToken: string) {
   const variables = { input: { firstName: newFirstName } };
   try {
      // Debug: log token if needed (only in dev)
      // console.log("Token in updateFirstName:", customerAccessToken);
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

// Similar changes for updateLastName, updateEmail, updatePhone, and updateBirthday...

export async function updateLastName(newLastName: string, customerAccessToken: string) {
   const variables = { input: { lastName: newLastName } };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer]
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating last name', error);
      throw new Error('Error updating last name');
   }
}

export async function updateEmail(newEmail: string, customerAccessToken: string) {
   const variables = { input: { email: newEmail } };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer]
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating email', error);
      throw new Error('Error updating email');
   }
}

export async function updatePhone(newPhone: string, customerAccessToken: string) {
   const variables = { input: { phone: newPhone } };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer]
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating phone number', error);
      throw new Error('Error updating phone number');
   }
}

// If birthday is stored as a metafield, ensure your Shopify setup allows this update.
export async function updateBirthday(newBirthday: string, customerAccessToken: string) {
   const variables = {
      input: {
         metafields: [
            {
               key: 'birthday',
               namespace: 'custom',
               value: newBirthday,
               type: 'single_line_text_field'
            }
         ]
      }
   };
   try {
      const response = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_UPDATE_MUTATION,
         variables: variables as any,
         tags: [TAGS.customer]
      });
      revalidateTag(TAGS.customer);
      return response;
   } catch (error) {
      console.error('Error updating birthday', error);
      throw new Error('Error updating birthday');
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
