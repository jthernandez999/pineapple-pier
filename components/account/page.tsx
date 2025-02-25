// account/page.tsx
import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { SHOPIFY_CUSTOMER_API_VERSION, TAGS } from 'lib/shopify/customer/constants';
import { CUSTOMER_DETAILS_QUERY } from 'lib/shopify/customer/queries/customer';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountDashboard from './account-dashboard';

export const runtime = 'edge';

const SHOP_DOMAIN = 'dearjohndenim.myshopify.com';
const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
const customerEndpoint = `https://${SHOP_DOMAIN}/account/customer/api/${apiVersion}/graphql`;

export default async function AccountPage() {
   const headersList = headers();
   const access = (await headersList).get('x-shop-customer-token');
   const shopCustomerToken = (await cookies()).get('shop_customer_token')?.value;
   // Use either the header value or the cookie value if available
   const customerAccessToken = access || shopCustomerToken;
   if (!customerAccessToken || customerAccessToken === 'denied') {
      redirect('/logout');
   }
   if (!access || access === 'denied') {
      console.error('ERROR: No valid access header on Account page');
      redirect('/logout');
   }

   let customerData: any;
   let orders: any;
   let success = true;
   let errorMessage: string | undefined;

   try {
      const responseCustomerDetails = await shopifyCustomerFetch({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_DETAILS_QUERY,
         tags: [TAGS.customer]
      });
      const userDetails = responseCustomerDetails.body as { data: { customer: any } };
      if (!userDetails) {
         throw new Error('Error getting actual user data on Account page.');
      }
      console.log(userDetails);
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
