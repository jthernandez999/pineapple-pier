// components/account/OrderDetails.tsx
'use client';

import Image from 'next/image';

type Address = {
   firstName: string;
   lastName: string;
   address1: string;
   city: string;
   province: string;
   zip: string;
   country: string;
   phone: string;
};

type OrderItem = {
   id: string;
   title: string;
   quantity: number;
   price: string;
   imageUrl: string;
};

type Order = {
   id: string;
   orderNumber: number;
   createdAt: string;
   fulfillmentStatus: string;
   totalPrice: string;
   shippingAddress: Address;
   billingAddress: Address;
   orderItems: OrderItem[];
   paymentMethod: string;
   paymentStatus: string;
};

type OrderDetailsProps = {
   order: Order;
};

export default function OrderDetails({ order }: OrderDetailsProps) {
   const formattedDate = new Date(order.createdAt).toLocaleDateString();

   return (
      <div className="mx-auto max-w-4xl p-4">
         {/* Header */}
         <header className="mb-6 flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center">
               {/* Replace with your actual logo */}
               <Image
                  src="/logo.png"
                  alt="DEAR JOHN DENIM"
                  width={100}
                  height={50}
                  className="mr-4"
               />
               <div>
                  <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                  <p className="text-gray-600">Confirmed {formattedDate}</p>
               </div>
            </div>
            <div className="mt-4 md:mt-0">
               <p className="text-lg font-semibold">
                  Fulfillment: <span className="text-green-600">{order.fulfillmentStatus}</span>
               </p>
            </div>
         </header>

         {/* Order Summary */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Order Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div>
                  <h3 className="font-semibold">Contact Information</h3>
                  <p>
                     {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.paymentMethod}</p>
               </div>
               <div>
                  <h3 className="font-semibold">Payment Status</h3>
                  <p>{order.paymentStatus}</p>
               </div>
            </div>
         </section>

         {/* Shipping Address */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Shipping Address</h2>
            <p>
               {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.address1}</p>
            <p>
               {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
               {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p>{order.shippingAddress.phone}</p>
         </section>

         {/* Billing Address */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Billing Address</h2>
            <p>
               {order.billingAddress.firstName} {order.billingAddress.lastName}
            </p>
            <p>{order.billingAddress.address1}</p>
            <p>
               {order.billingAddress.city}, {order.billingAddress.province}{' '}
               {order.billingAddress.zip}
            </p>
            <p>{order.billingAddress.country}</p>
            <p>{order.billingAddress.phone}</p>
         </section>

         {/* Order Items */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Order Items</h2>
            <div className="space-y-4">
               {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-md border p-4">
                     <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                     />
                     <div>
                        <p className="font-semibold">{item.title}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p className="font-bold">
                           {order.totalPrice.currencyCode} {parseFloat(item.price).toFixed(2)}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Order Totals */}
         <section className="mb-6">
            <h2 className="mb-2 text-xl font-bold">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="font-medium">Subtotal</p>
                  {/* Replace with actual subtotal if available */}
                  <p>$XX.XX</p>
               </div>
               <div>
                  <p className="font-medium">Shipping</p>
                  {/* Replace with actual shipping value if available */}
                  <p>$XX.XX</p>
               </div>
               <div className="col-span-2">
                  <p className="font-medium">Total</p>
                  <p className="text-2xl font-bold">${order.totalPrice}</p>
               </div>
            </div>
         </section>

         {/* Refund / Payment Status */}
         <section>
            <h2 className="mb-2 text-xl font-bold">Refund / Payment Status</h2>
            <p>{order.paymentStatus}</p>
         </section>
      </div>
   );
}
