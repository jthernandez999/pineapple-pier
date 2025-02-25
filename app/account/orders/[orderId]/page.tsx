import OrderDetails from 'components/account/OrderDetails';
import { shopifyCustomerFetch } from 'lib/shopify/customer';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function OrderPage(props: any): Promise<React.ReactElement> {
   const { params, searchParams } = props;
   const { orderId } = params;

   // headers() is synchronous
   const token = (await headers()).get('x-shop-customer-token') ?? '';
   if (!token || token === 'denied') {
      console.error('ERROR: No valid access header on Account page');
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
   const variables = { orderId };

   const res = await shopifyCustomerFetch({
      customerToken: customerAccessToken,
      cache: 'no-store',
      query,
      variables: variables as any
   });

   // Our shopifyCustomerFetch returns an object with status and body.
   const json = res.body as { data: any; errors?: any };
   if (res.status !== 200 || json.errors) {
      console.error('Error fetching order details:', json.errors);
      return <p>Error fetching order details.</p>;
   }

   const order = json.data.order;
   return <OrderDetails order={order} />;
}
