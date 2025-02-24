'use client';
import Link from 'next/link';
import { useState } from 'react';

type Order = {
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
   // Accept orders as any and cast internally
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
         <button className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
            Start Shopping
         </button>
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

function OrderCard({ order, onClick }: OrderCardProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   return (
      <div
         onClick={onClick}
         className="cursor-pointer rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
      >
         <div className="mb-4 flex items-center justify-between">
            <div>
               <h3 className="text-lg font-semibold text-blue-600 underline">
                  Order #{order.number}
               </h3>
               <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
            <div className="text-right">
               <p className="text-sm font-medium capitalize">{order.financialStatus}</p>
               <p className="text-lg font-bold">
                  {order.totalPrice.currencyCode} {parseFloat(order.totalPrice.amount).toFixed(2)}
               </p>
            </div>
         </div>
         <div>
            <h4 className="mb-2 text-sm font-semibold">Items</h4>
            <ul className="flex space-x-4 overflow-auto">
               {order.lineItems.edges.map(({ node }) => (
                  <li key={node.title} className="flex-shrink-0">
                     <img
                        src={node.image.url}
                        alt={node.image.altText}
                        className="h-16 w-16 rounded object-cover"
                     />
                     <p className="mt-1 text-center text-xs">{node.title}</p>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   );
}

type OrderModalProps = {
   order: Order;
   onClose: () => void;
};

function OrderModal({ order, onClose }: OrderModalProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   // Helper to create a slug from the product title.
   const createSlug = (title: string) =>
      title
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-')
         .replace(/^-+|-+$/g, '');

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
         {/* Modal backdrop */}
         <div className="fixed inset-0 bg-black opacity-50" aria-hidden="true" />
         {/* Modal content */}
         <div
            className="relative z-10 mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
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
            <div className="mb-4">
               <p className="text-sm font-medium capitalize">Status: {order.financialStatus}</p>
               <p className="text-lg font-bold">
                  {order.totalPrice.currencyCode} {parseFloat(order.totalPrice.amount).toFixed(2)}
               </p>
            </div>
            <div>
               <h4 className="mb-2 text-sm font-semibold">Items</h4>
               <ul className="max-h-60 space-y-4 overflow-auto">
                  {order.lineItems.edges.map(({ node }) => (
                     <li key={node.title} className="flex items-center space-x-4">
                        <Link href={`/product/${createSlug(node.title)}`}>
                           <img
                              src={node.image.url}
                              alt={node.image.altText}
                              className="h-16 w-16 cursor-pointer rounded object-cover"
                           />
                        </Link>
                        <Link href={`/product/${createSlug(node.title)}`}>
                           <span className="cursor-pointer text-sm hover:underline">
                              {node.title}
                           </span>
                        </Link>
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
   );
}

export default AccountOrdersHistory;
