// app/account/orders/[orderId]/page.tsx
import OrderDetails from 'components/account/OrderDetails';
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
   const token = (await headers()).get('x-shop-customer-token');
   if (!token || token === 'denied') {
      redirect('/logout');
   }
   const customerAccessToken = token;

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
   // Cast variables to any to satisfy the expected type
   const variables = { orderId } as any;

   const res = await fetch('https://shopify.com/10242207/account/customer/api/unstable/graphql', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Authorization: customerAccessToken
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
   });

   // Explicitly cast json result to the expected shape
   const json = (await res.json()) as { data: any; errors?: any };

   if (!res.ok || json.errors) {
      console.error('Error fetching order details:', json.errors);
      return <p>Error fetching order details.</p>;
   }

   const order = json.data.order;
   return <OrderDetails order={order} />;
}
