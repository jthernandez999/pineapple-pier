'use client';
type OrderCardsProps = {
   orders: any;
};

export function AccountOrdersHistory({ orders }: { orders: any }) {
   return (
      <div className="mt-6">
         <div className="grid w-full gap-4 p-4 py-6 md:gap-8 md:p-8 lg:p-12">
            <h2 className="text-lead font-bold">Order History</h2>
            {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />}
         </div>
      </div>
   );
}

function EmptyOrders() {
   return (
      <div>
         <div className="mb-1">You haven&apos;t placed any orders yet.</div>
         <div className="w-48">
            <button
               className="mt-2 w-full text-sm"
               //variant="secondary"
            >
               Start Shopping
            </button>
         </div>
      </div>
   );
}

function Orders({ orders }: OrderCardsProps) {
   return (
      <ul className="false grid grid-flow-row grid-cols-1 gap-2 gap-y-6 sm:grid-cols-3 md:gap-4 lg:gap-6">
         {orders.map((order: any) => (
            <li key={order.node.id}>
               {order.node.number}
               <OrderCard order={order} />
            </li>
         ))}
      </ul>
   );
}

function OrderCard({ order }: { order: any }) {
   return (
      <div>
         <div className="flex justify-between">
            <div>
               <div className="text-sm font-bold">Order Number</div>
               <div className="text-sm">{order.node.number}</div>
            </div>
            <div>
               <div className="text-sm font-bold">Order Date</div>
               <div className="text-sm">{order.node.created}</div>
            </div>
         </div>
         <div>
            <div className="text-sm font-bold">Items</div>
            <div className="text-sm">{order.node.items.length}</div>
         </div>
         <div>
            <div className="text-sm font-bold">Total</div>
            <div className="text-sm">{order.node.total}</div>
         </div>
      </div>
   );
}
