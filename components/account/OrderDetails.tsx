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
   orderNumber: string;
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
   return (
      <div className="mx-auto max-w-4xl p-4">
         {/* Header Section */}
         <header className="mb-6 flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center">
               <Image
                  src="/logo.png"
                  alt="DEAR JOHN DENIM"
                  width={100}
                  height={50}
                  className="mr-4"
               />
               <div>
                  <h1 className="text-2xl font-bold">{`Order #${order.orderNumber}`}</h1>
                  <p className="text-gray-600">{`Confirmed ${new Date(order.createdAt).toLocaleDateString()}`}</p>
               </div>
            </div>
            <div className="mt-4 md:mt-0">
               <p className="text-lg font-semibold">
                  Fulfillment status:{' '}
                  <span className="text-green-600">{order.fulfillmentStatus}</span>
               </p>
            </div>
         </header>

         {/* Order Summary Section */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Order Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div>
                  <h3 className="font-semibold">Contact Information</h3>
                  <p>{`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.paymentMethod}</p>
               </div>
               <div>
                  <h3 className="font-semibold">Payment Status</h3>
                  <p>{order.paymentStatus}</p>
               </div>
            </div>
         </section>

         {/* Shipping Address Section */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Shipping Address</h2>
            <p>{`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</p>
            <p>{order.shippingAddress.address1}</p>
            <p>{`${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.zip}`}</p>
            <p>{order.shippingAddress.country}</p>
            <p>{order.shippingAddress.phone}</p>
         </section>

         {/* Billing Address Section */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Billing Address</h2>
            <p>{`${order.billingAddress.firstName} ${order.billingAddress.lastName}`}</p>
            <p>{order.billingAddress.address1}</p>
            <p>{`${order.billingAddress.city}, ${order.billingAddress.province} ${order.billingAddress.zip}`}</p>
            <p>{order.billingAddress.country}</p>
            <p>{order.billingAddress.phone}</p>
         </section>

         {/* Order Items Section */}
         <section className="mb-6 border-b pb-4">
            <h2 className="mb-2 text-xl font-bold">Order Items</h2>
            {order.orderItems.map((item) => (
               <div key={item.id} className="mb-2 flex items-center gap-4 rounded-md border p-4">
                  <Image
                     src={item.imageUrl}
                     alt={item.title}
                     width={60}
                     height={60}
                     className="rounded-md"
                  />
                  <div>
                     <p className="font-semibold">{item.title}</p>
                     <p>Quantity: {item.quantity}</p>
                     <p className="font-bold">${item.price}</p>
                  </div>
               </div>
            ))}
         </section>

         {/* Order Totals Section */}
         <section className="mb-6">
            <h2 className="mb-2 text-xl font-bold">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="font-medium">Subtotal</p>
                  {/* Replace with actual value */}
                  <p>$XX.XX</p>
               </div>
               <div>
                  <p className="font-medium">Shipping</p>
                  <p>$XX.XX</p>
               </div>
               <div className="col-span-2">
                  <p className="font-medium">Total</p>
                  <p className="text-2xl font-bold">${order.totalPrice}</p>
               </div>
            </div>
         </section>

         <section>
            <h2 className="mb-2 text-xl font-bold">Refund / Payment Status</h2>
            <p>{order.paymentStatus}</p>
         </section>
      </div>
   );
}
