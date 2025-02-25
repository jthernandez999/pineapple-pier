// app/account/orders/[orderId]/page.tsx
import OrderDetails from 'components/account/OrderDetails';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function OrderPage(props: any): Promise<React.ReactElement> {
   // Destructure params and searchParams from props.
   const { params, searchParams } = props;
   const { orderId } = params;

   const token = (await headers()).get('x-shop-customer-token');
   if (!token || token === 'denied') {
      console.error('ERROR: No valid access header on Account page');
      redirect('/logout');
   }
   const customerAccessToken = token;

   // Define the GraphQL query for order details.
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

   const res = await fetch('https://shopify.com/10242207/account/customer/api/unstable/graphql', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Authorization: customerAccessToken
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
   });

   const json = await res.json();
   if (!res.ok || json.errors) {
      console.error('Error fetching order details:', json.errors);
      return <p>Error fetching order details.</p>;
   }

   const order = json.data.order;
   return <OrderDetails order={order} />;
}
