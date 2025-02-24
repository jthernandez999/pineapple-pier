'use client';
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
   // The orders prop is received as any and cast internally.
   orders: any;
};

export function AccountOrdersHistory({ orders }: AccountOrdersHistoryProps) {
   // Cast the orders to our expected OrderEdge array
   const typedOrders = orders as OrderEdge[];

   // State to track the selected order for modal display
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
            <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
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
            <OrderCard key={orderEdge.node.id} order={orderEdge.node} onSelect={onSelectOrder} />
         ))}
      </div>
   );
}

type OrderCardProps = {
   order: Order;
   onSelect: (order: Order) => void;
};

function OrderCard({ order, onSelect }: OrderCardProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   return (
      <div className="rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
         <div className="mb-4 flex items-center justify-between">
            <div>
               <button
                  onClick={() => onSelect(order)}
                  className="text-lg font-semibold text-blue-600 hover:underline focus:outline-none"
               >
                  Order #{order.number}
               </button>
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

type OrderDetailsModalProps = {
   order: Order;
   onClose: () => void;
};

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
         <div className="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
            <button
               onClick={onClose}
               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
               aria-label="Close modal"
            >
               &times;
            </button>
            <div className="mb-4">
               <h3 className="text-xl font-bold">Order #{order.number}</h3>
               <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
            <div className="mb-4">
               <p className="font-semibold">Status:</p>
               <p className="capitalize">{order.financialStatus}</p>
            </div>
            <div className="mb-4">
               <p className="font-semibold">Total:</p>
               <p>
                  {order.totalPrice.currencyCode} {parseFloat(order.totalPrice.amount).toFixed(2)}
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Items:</p>
               <ul className="space-y-4">
                  {order.lineItems.edges.map(({ node }) => (
                     <li key={node.title} className="flex items-center space-x-4">
                        <img
                           src={node.image.url}
                           alt={node.image.altText}
                           className="h-20 w-20 rounded object-cover"
                        />
                        <span>{node.title}</span>
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
   );
}

export default AccountOrdersHistory;
