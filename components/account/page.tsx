// account/page.tsx
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

export default async function AccountPage() {
   // Get headers synchronously
   const headersList = await headers();
   const access = headersList.get('x-shop-customer-token');
   // console.log('x-shop-customer-token header:', access);

   // Get cookie value asynchronously
   const shopCustomerToken = (await cookies()).get('shop_customer_token')?.value;
   // console.log('shop_customer_token cookie:', shopCustomerToken);

   // Use header if available, otherwise fall back to the cookie
   const customerAccessToken = access || shopCustomerToken;
   // console.log('Using customerAccessToken:', customerAccessToken);

   if (!customerAccessToken || customerAccessToken === 'denied') {
      console.error('No valid customerAccessToken found. Redirecting to logout.');
      redirect('/logout');
   }

   // Log a warning if header is missing
   if (!access) {
      console.warn('x-shop-customer-token header not present; falling back to cookie value.');
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
      // console.log('Customer details response:', responseCustomerDetails);

      const userDetails = responseCustomerDetails.body as { data: { customer: any } };
      if (!userDetails) {
         throw new Error('Error getting actual user data on Account page.');
      }
      customerData = userDetails.data?.customer;
      orders = customerData?.orders?.edges;

      // console.log('Customer Data:', customerData);
      // console.log('Orders:', orders);
   } catch (e: any) {
      errorMessage = e?.error?.toString() ?? 'Unknown Error';
      console.error('Error fetching customer data on Account page:', e);
      if (errorMessage !== 'unauthorized') {
         throw new Error('Error getting actual user data on Account page.');
      } else {
         success = false;
      }
   }

   if (!success && errorMessage === 'unauthorized') {
      console.error('Unauthorized error detected. Redirecting to logout.');
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
