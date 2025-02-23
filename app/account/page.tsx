import { AccountOrdersHistory } from 'components/account/account-orders-history';
import { AccountProfile } from 'components/account/account-profile';
import { SHOPIFY_CUSTOMER_API_VERSION, TAGS } from 'lib/shopify/customer/constants';
import { shopifyCustomerFetch } from 'lib/shopify/customer/index';
import { CUSTOMER_DETAILS_QUERY } from 'lib/shopify/customer/queries/customer';
import { CustomerDetailsData } from 'lib/shopify/customer/types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

// Use your shop's actual domain for the GraphQL endpoint..
const SHOP_DOMAIN = 'dearjohndenim.myshopify.com';
const apiVersion = SHOPIFY_CUSTOMER_API_VERSION;
const customerEndpoint = `https://${SHOP_DOMAIN}/account/customer/api/${apiVersion}/graphql`;

export default async function AccountPage() {
   // Retrieve headers from the incoming request.
   const headersList = headers();
   const access = (await headersList).get('x-shop-customer-token');

   if (!access || access === 'denied') {
      console.error('ERROR: No valid access header on Account page');
      redirect('/logout');
   }

   // Prepend "Bearer " so that the Authorization header is correct.
   const customerAccessToken = `Bearer ${access}`;

   let customerData;
   let orders;
   let success = true;
   let errorMessage: string | undefined;

   try {
      // Call the Shopify Customer GraphQL API using shopifyCustomerFetch.
      const responseCustomerDetails = await shopifyCustomerFetch<CustomerDetailsData>({
         customerToken: customerAccessToken,
         cache: 'no-store',
         query: CUSTOMER_DETAILS_QUERY,
         tags: [TAGS.customer]
      });
      const userDetails = responseCustomerDetails.body;
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
         console.error('Unauthorized access. Redirecting to logout.');
         success = false;
      }
   }
   if (!success && errorMessage === 'unauthorized') {
      redirect('/logout');
   }

   return (
      <div className="mx-auto max-w-screen-2xl px-4">
         <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
            <div className="h-full w-full">
               <div>Welcome: {customerData?.emailAddress.emailAddress}</div>
            </div>
            <div className="h-full w-full">
               <div className="mt-5">
                  <AccountProfile />
               </div>
            </div>
            <div className="h-full w-full">
               <div className="mt-5">{orders && <AccountOrdersHistory orders={orders} />}</div>
            </div>
         </div>
      </div>
   );
}
