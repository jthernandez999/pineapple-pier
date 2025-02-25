import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { SHOPIFY_CUSTOMER_API_VERSION, TAGS } from 'lib/shopify/customer/constants';
import { CUSTOMER_DETAILS_QUERY } from 'lib/shopify/customer/queries/customer';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountDashboard from '../../components/account/account-dashboard';

export const runtime = 'edge';

const SHOP_DOMAIN = 'dearjohndenim.myshopify.com';
const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
const customerEndpoint = `https://${SHOP_DOMAIN}/account/customer/api/${apiVersion}/graphql`;

export default async function AccountPage() {
   const headersList = headers();
   const access = (await headersList).get('x-shop-customer-token');

   if (!access || access === 'denied') {
      console.error('ERROR: No valid access header on Account page');
      redirect('/logout');
   }

   const customerAccessToken = access;
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
