'use client';

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
   // Accept any orders object, then cast it internally
   orders: any;
};

export function AccountOrdersHistory({ orders }: AccountOrdersHistoryProps) {
   // Cast the orders to our expected OrderEdge array
   const typedOrders = orders as OrderEdge[];
   return (
      <section className="container mx-auto mt-8 px-4">
         <h2 className="mb-6 text-2xl font-bold">Order History</h2>
         {typedOrders && typedOrders.length > 0 ? <Orders orders={typedOrders} /> : <EmptyOrders />}
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
};

function Orders({ orders }: OrdersProps) {
   return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {orders.map((orderEdge) => (
            <OrderCard key={orderEdge.node.id} order={orderEdge.node} />
         ))}
      </div>
   );
}

type OrderCardProps = {
   order: Order;
};

function OrderCard({ order }: OrderCardProps) {
   const formattedDate = new Date(order.processedAt).toLocaleDateString();

   return (
      <div className="rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
         <div className="mb-4 flex items-center justify-between">
            <div>
               <h3 className="text-lg font-semibold">Order #{order.number}</h3>
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

export default AccountOrdersHistory;
