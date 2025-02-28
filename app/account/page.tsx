import jwt from 'jsonwebtoken';
import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { SHOPIFY_CUSTOMER_API_VERSION, TAGS } from 'lib/shopify/customer/constants';
import { CUSTOMER_DETAILS_QUERY } from 'lib/shopify/customer/queries/customer';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountDashboard from '../../components/account/account-dashboard';

export const runtime = 'edge';

const SHOP_DOMAIN = 'dearjohndenim.myshopify.com';
const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
const customerEndpoint = `https://${SHOP_DOMAIN}/account/customer/api/${apiVersion}/graphql`;

// Make sure your environment has JWT_SECRET set.
const JWT_SECRET = process.env.JWT_SECRET;

export default async function AccountPage() {
   const headersList = await headers();
   const access = headersList.get('x-shop-customer-token');
   const shopCustomerToken = (await cookies()).get('shop_customer_token')?.value;
   // Rely on either the header or the cookie.
   const customerAccessToken = access || shopCustomerToken;

   if (!customerAccessToken || customerAccessToken === 'denied') {
      redirect('/logout');
   }

   // Verify the JWT to ensure the token is valid and not expired.
   if (JWT_SECRET) {
      try {
         jwt.verify(customerAccessToken, JWT_SECRET);
      } catch (error) {
         console.error('Token verification failed:', error);
         redirect('/logout');
      }
   } else {
      console.warn('JWT_SECRET not defined. Skipping token verification.');
   }

   let customerData;
   let orders;
   let success = true;
   let errorMessage: string | undefined;

   try {
      const responseCustomerDetails = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_DETAILS_QUERY,
         tags: [TAGS.customer]
      });
      const userDetails = responseCustomerDetails.body as { data: any };
      if (!userDetails) {
         throw new Error('Error getting actual user data on Account page.');
      }
      customerData = userDetails.data?.customer;
      orders = customerData?.orders?.edges;
   } catch (e: any) {
      errorMessage = e?.error?.toString() ?? 'Unknown Error';
      console.error('Error fetching customer data on Account page', e);
      if (errorMessage !== 'unauthorized') {
         throw new Error('Error getting actual user data on Account page.');
      } else {
         success = false;
      }
   }
   if (!success && errorMessage === 'unauthorized') {
      redirect('/logout');
   }

   return (
      <AccountDashboard
         customerData={customerData}
         orders={orders}
         customerAccessToken={customerAccessToken}
      />
   );
}
