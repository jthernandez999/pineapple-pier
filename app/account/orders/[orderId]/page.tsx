// components/account/OrderPage.tsx
import OrderDetails from 'components/account/OrderDetails';
import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function OrderPage(props: any): Promise<React.ReactElement> {
   const { params } = props;
   const { orderId } = params;

   // Retrieve the token from cookies (server-side)
   const token = (await cookies()).get('shop_customer_token')?.value ?? '';
   //  console.log('OrderPage: Retrieved token:', token);

   if (!token || token === 'denied') {
      console.error('OrderPage: No valid customer token found, redirecting to /logout');
      redirect('/logout');
   }
   const customerAccessToken = token;

   const query = `
    query OrderDetails($orderId: ID!) {
      order(id: $orderId) {
        id
        number
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

   const res = await shopifyCustomerFetch({
      customerToken: customerAccessToken,
      cache: 'no-store',
      query,
      variables: variables as any
   });

   const json = res.body as { data: any; errors?: any };
   if (res.status !== 200 || json.errors) {
      console.error('OrderPage: Error fetching order details:', json.errors);
      return <p>Error fetching order details.</p>;
   }

   const order = json.data.order;
   //  console.log('OrderPage: Fetched order details successfully.');
   return <OrderDetails order={order} />;
}
