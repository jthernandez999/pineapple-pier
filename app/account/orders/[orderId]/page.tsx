// app/account/orders/[orderId]/page.tsx
import OrderDetails from 'components/account/OrderDetails';
import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function OrderPage({
   params,
   searchParams
}: {
   params: { orderId: string };
   searchParams: { [key: string]: string | string[] };
}): Promise<React.ReactElement> {
   const { orderId } = params;

   // Ensure token is a string (defaulting to empty string if missing)
   const token = (await headers()).get('x-shop-customer-token') ?? '';
   if (!token || token === 'denied') {
      console.error('ERROR: No valid access header on Account page');
      redirect('/logout');
   }
   const customerAccessToken = token;

   // GraphQL query to fetch order details.
   const query = `
    query OrderDetails($orderId: ID!) {
      order(id: $orderId) {
        id
        orderNumber
        createdAt
        fulfillmentStatus
        totalPrice
        shippingAddress {
          firstName
          lastName
          address1
          city
          province
          zip
          country
          phone
        }
        billingAddress {
          firstName
          lastName
          address1
          city
          province
          zip
          country
          phone
        }
        orderItems {
          id
          title
          quantity
          price
          imageUrl
        }
        paymentMethod
        paymentStatus
      }
    }
  `;
   const variables = { orderId };

   // Use your custom fetch function
   const res = await shopifyCustomerFetch({
      customerToken: customerAccessToken,
      cache: 'no-store',
      query,
      variables: variables as any
   });

   // Since shopifyCustomerFetch returns { status, body },
   // we use res.status and res.body directly.
   const json = res.body as { data: any; errors?: any };
   if (res.status !== 200 || json.errors) {
      console.error('Error fetching order details:', json.errors);
      return <p>Error fetching order details.</p>;
   }

   const order = json.data.order;
   return <OrderDetails order={order} />;
}
