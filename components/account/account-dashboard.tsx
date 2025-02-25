// account/account-dashboard.tsx
'use client';

import { useState } from 'react';
import { AccountAddressInfo } from './account-address-info';
import { AccountOrdersHistory } from './account-orders-history';
import { AccountPersonalInfo } from './account-personal-info';
import { AccountProfile } from './account-profile';

type AccountDashboardProps = {
   customerData: any;
   orders: any;
   customerAccessToken: string;
};

export default function AccountDashboard({
   customerData,
   orders,
   customerAccessToken
}: AccountDashboardProps) {
   const [activeMenu, setActiveMenu] = useState<string>('purchase');

   const renderContent = () => {
      switch (activeMenu) {
         case 'orders':
            return orders ? <AccountOrdersHistory orders={orders} /> : <p>No orders found.</p>;
         case 'manage':
            return <AccountProfile />;
         case 'personal':
            return (
               <AccountPersonalInfo
                  customerData={customerData}
                  customerAccessToken={customerAccessToken}
               />
            );
         case 'address':
            return (
               <AccountAddressInfo
                  addressData={customerData?.defaultAddress}
                  customerAccessToken={customerAccessToken}
               />
            );
         default:
            return <p>Content for "{activeMenu}" coming soon.</p>;
      }
   };

   return (
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4 py-8 md:flex-row">
         {/* Sidebar Menu */}
         <aside className="mb-8 w-full md:mb-0 md:w-1/4 md:pr-8">
            <div className="mb-4">
               <h2 className="text-xl font-bold">Account / Home</h2>
               <p className="mt-2">Hi, {customerData?.emailAddress?.emailAddress || 'Guest'}</p>
            </div>
            <nav>
               <ul className="flex flex-wrap md:block">
                  {['orders', 'manage', 'personal', 'address'].map((menu) => (
                     <li key={menu} className="w-1/2 md:w-full">
                        <button
                           className={`mb-1 block w-full rounded-md px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              activeMenu === menu ? 'bg-gray-300 dark:bg-gray-600' : ''
                           }`}
                           onClick={() => setActiveMenu(menu)}
                        >
                           {menu.charAt(0).toUpperCase() + menu.slice(1)}
                        </button>
                     </li>
                  ))}
               </ul>
            </nav>
         </aside>
         {/* Main Content */}
         <main className="w-full md:w-3/4 md:border-l md:border-neutral-200 md:pl-8 dark:md:border-neutral-800">
            {renderContent()}
         </main>
      </div>
   );
}
