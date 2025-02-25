// app/account/orders/[orderId]/page.tsx
import OrderDetails from 'components/account/OrderDetails';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
export default async function OrderPage({ params }: { params: { orderId: string } }) {
   const { orderId } = params;
   // Get the customer token from headers (or you could read from cookies if preferred)
   const customerToken = (await headers()).get('x-shop-customer-token');
   if (!customerToken || customerToken === 'denied') {
      redirect('/logout');
   }

   // Define your GraphQL query for fetching order details.
   // Adjust fields as needed.
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

   // Use standard fetch to query Shopify's GraphQL endpoint
   const response = await fetch(
      'https://shopify.com/10242207/account/customer/api/unstable/graphql',
      {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: customerToken
         },
         body: JSON.stringify({ query, variables }),
         cache: 'no-store'
      }
   );

   const json = await response.json();
   if (!response.ok || json.errors) {
      console.error('Error fetching order details:', json.errors);
      return <p>Error fetching order details.</p>;
   }

   const order = json.data.order;

   return <OrderDetails order={order} />;
}
