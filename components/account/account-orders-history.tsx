// account/account-orders-history.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useState } from 'react';

type Order = {
   orderNumber: ReactNode;
   id: string;
   number: number;
   processedAt: string;
   financialStatus: string;
   totalPrice: {
      amount: string;
      currencyCode: string;
   };
   lineItems: {
      edges: Array<{
         node: {
            title: string;
            image: {
               url: string;
               altText: string;
               width: number;
               height: number;
            };
         };
      }>;
   };
};

type OrderEdge = {
   node: Order;
};

type AccountOrdersHistoryProps = {
   orders: any;
};

export function AccountOrdersHistory({ orders }: AccountOrdersHistoryProps) {
   const typedOrders = orders as OrderEdge[];
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

   return (
      <section className="container mx-auto mt-8 px-4">
         <h2 className="mb-6 text-2xl font-bold">Order History</h2>
         {typedOrders && typedOrders.length > 0 ? (
            <Orders orders={typedOrders} onSelectOrder={setSelectedOrder} />
         ) : (
            <EmptyOrders />
         )}

         {selectedOrder && (
            <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
         )}
      </section>
   );
}

function EmptyOrders() {
   return (
      <div className="py-10 text-center">
         <p className="mb-4 text-gray-500">You haven’t placed any orders yet.</p>
         <Link href="/">
            <button className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
               Start Shopping
            </button>
         </Link>
      </div>
   );
}

type OrdersProps = {
   orders: OrderEdge[];
   onSelectOrder: (order: Order) => void;
};

function Orders({ orders, onSelectOrder }: OrdersProps) {
   return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {orders.map((orderEdge) => (
            <OrderCard
               key={orderEdge.node.id}
               order={orderEdge.node}
               onClick={() => onSelectOrder(orderEdge.node)}
            />
         ))}
      </div>
   );
}

type OrderCardProps = {
   order: Order;
   onClick: () => void;
};

export function OrderCard({ order }: OrderCardProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   return (
      <Link href={`/account/orders/${order.id}`}>
         <a className="cursor-pointer">
            <div className="rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-lg font-semibold text-blue-600 underline">
                        Order #{order.orderNumber}
                     </h3>
                     <p className="text-sm text-gray-500">Confirmed {formattedDate}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-medium capitalize">{order.financialStatus}</p>
                     <p className="text-lg font-bold">
                        {order.totalPrice.currencyCode}{' '}
                        {parseFloat(order.totalPrice.amount).toFixed(2)}
                     </p>
                  </div>
               </div>
               <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold">Items</h4>
                  <ul className="flex space-x-4 overflow-x-auto">
                     {order.lineItems.edges.map(({ node }, index) => (
                        <li key={index} className="flex-shrink-0">
                           <Image
                              src={node.image.url}
                              alt={node.image.altText || node.title}
                              width={60}
                              height={60}
                              className="rounded object-cover"
                              unoptimized
                           />
                           <p className="mt-1 text-center text-xs">{node.title}</p>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </a>
      </Link>
   );
}

type OrderModalProps = {
   order: Order;
   onClose: () => void;
};

function OrderModal({ order, onClose }: OrderModalProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
         {/* Modal backdrop */}
         <div className="fixed inset-0 bg-black opacity-50" aria-hidden="true" />
         {/* Modal content */}
         <div
            className="relative z-10 mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="mb-4 flex items-center justify-between">
               <h3 className="text-xl font-semibold">Order #{order.number}</h3>
               <button
                  onClick={onClose}
                  className="text-2xl font-bold text-gray-500 hover:text-gray-700"
               >
                  &times;
               </button>
            </div>
            <p className="mb-2 text-sm text-gray-500">{formattedDate}</p>
            {/* Add additional order detail sections here */}
            <div className="mt-4">
               <h4 className="text-lg font-bold">Order Summary</h4>
               <p className="mt-1">
                  {order.totalPrice.currencyCode} {parseFloat(order.totalPrice.amount).toFixed(2)}
               </p>
            </div>
            {/* You can expand this modal to include shipping, billing, items, etc. */}
         </div>
      </div>
   );
}

export default AccountOrdersHistory;
